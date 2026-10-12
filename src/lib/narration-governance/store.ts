import {DatabaseSync} from 'node:sqlite';
import {chmodSync,existsSync,lstatSync,openSync,closeSync} from 'node:fs';
import {canonical,digest,GovernanceError,LedgerSchema,type Ledger} from './contracts';

/** Separate Node 24+ administration runtime. Local durable implementation, no cloud provisioning. */
export class SqliteGovernanceStore {
  private db:DatabaseSync;
  constructor(path:string,capMicros=0) {
    if(!Number.isSafeInteger(capMicros) || capMicros<0) throw new GovernanceError('BUDGET');
    if(path!==':memory:') {
      if(!existsSync(path)) closeSync(openSync(path,'wx',0o600));
      const stat=lstatSync(path);
      if(!stat.isFile() || stat.isSymbolicLink() || stat.mode&0o077) throw new GovernanceError('DENIED');
      chmodSync(path,0o600);
    }
    this.db=new DatabaseSync(path);
    this.db.exec('PRAGMA busy_timeout=3000; PRAGMA journal_mode=DELETE; PRAGMA synchronous=FULL;');
    this.db.exec('CREATE TABLE IF NOT EXISTS governance (id INTEGER PRIMARY KEY CHECK(id=1), version INTEGER NOT NULL CHECK(version=1), body TEXT NOT NULL);');
    this.db.exec(`CREATE TABLE IF NOT EXISTS audit (sequence INTEGER PRIMARY KEY, body TEXT NOT NULL);
      CREATE TRIGGER IF NOT EXISTS audit_no_update BEFORE UPDATE ON audit BEGIN SELECT RAISE(ABORT,'append-only audit'); END;
      CREATE TRIGGER IF NOT EXISTS audit_no_delete BEFORE DELETE ON audit BEGIN SELECT RAISE(ABORT,'append-only audit'); END;`);
    this.db.prepare('INSERT OR IGNORE INTO governance VALUES (1,1,?)').run(canonical({jobs:{},requests:{},reserved:0,spent:0,cap:capMicros,events:[]}));
    this.verify(this.snapshot());
  }
  private verify(ledger:Ledger) {
    LedgerSchema.parse(ledger);
    if(ledger.reserved+ledger.spent>ledger.cap || Object.values(ledger.jobs).reduce((sum,j)=>sum+j.reservation,0)!==ledger.reserved) throw new GovernanceError('INTEGRITY');
    let previous=digest('ADR-0032/audit/v1');
    for(const [index,event] of ledger.events.entries()) {
      const {hash,...body}=event;
      if(body.sequence!==index+1 || body.previous!==previous || digest(canonical(body))!==hash) throw new GovernanceError('INTEGRITY');
      previous=hash;
    }
  }
  snapshot():Ledger {
    const row=this.db.prepare('SELECT body FROM governance WHERE id=1').get() as {body:string};
    const value=LedgerSchema.parse(JSON.parse(row.body)) as Ledger;this.verify(value);
    const audit=this.db.prepare('SELECT body FROM audit ORDER BY sequence').all() as {body:string}[];
    if(canonical(audit.map(r=>JSON.parse(r.body)))!==canonical(value.events)) throw new GovernanceError('INTEGRITY');
    return value;
  }
  transaction<T>(operation:(ledger:Ledger)=>T):T {
    this.db.exec('BEGIN IMMEDIATE');
    try {
      const ledger=this.snapshot();const count=ledger.events.length;const prior=canonical(ledger.events);const result=operation(ledger);this.verify(ledger);
      if(canonical(ledger.events.slice(0,count))!==prior) throw new GovernanceError('INTEGRITY');
      const append=this.db.prepare('INSERT INTO audit VALUES (?,?)');
      for(const event of ledger.events.slice(count)) append.run(event.sequence,canonical(event));
      this.db.prepare('UPDATE governance SET body=? WHERE id=1').run(canonical(ledger));
      this.db.exec('COMMIT');return result;
    } catch(error) {this.db.exec('ROLLBACK');throw error;}
  }
  /** Export to separately retained, access-controlled storage before activation. Not a signature. */
  exportAudit() {return canonical(this.snapshot().events);}
  close() {this.db.close();}
}
