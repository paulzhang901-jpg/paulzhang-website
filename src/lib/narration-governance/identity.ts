import {createPublicKey,verify, type KeyObject} from 'node:crypto';
import {z} from 'zod';
import {GovernanceError,identifier,type Role} from './contracts';

const Claims = z.object({iss:z.string(),aud:z.string(),sub:identifier,sid:identifier,exp:z.number().int(),iat:z.number().int(),nbf:z.number().int().optional()});
const Header = z.object({alg:z.literal('RS256'),typ:z.literal('JWT'),kid:identifier}).strict();
export interface IdentityDirectory {
  /** Server-side authoritative session revocation and role grants. No token role claims. */
  sessionActive(subject:string,session:string):boolean;
  roles(subject:string):readonly Role[];
}
export class VerifiedIdentity {
  private readonly brand = true;
  private constructor(readonly subject:string,readonly session:string,readonly expires:number) {}
  static issue(subject:string,session:string,expires:number) {return new VerifiedIdentity(subject,session,expires);}
}
/** Fixed issuer/audience and provisioned keys; never use token-selected URLs or algorithms. */
export class IdentityVerifier {
  private readonly issued = new WeakSet<VerifiedIdentity>();
  private readonly keys:Map<string,KeyObject>;
  constructor(private issuer:string,private audience:string,keys:ReadonlyMap<string,string>,private directory:IdentityDirectory,private now:()=>number=Date.now) {
    this.keys=new Map([...keys].map(([id,pem])=>[id,createPublicKey(pem)]));
    if(!issuer || !audience || !this.keys.size) throw new GovernanceError('DENIED');
  }
  authenticate(token:string):VerifiedIdentity {
    try {
      if(token.length>16384) throw new Error();
      const parts=token.split('.');if(parts.length!==3 || parts.some(p=>!p || !/^[A-Za-z0-9_-]+$/.test(p))) throw new Error();
      const h=Header.parse(JSON.parse(Buffer.from(parts[0],'base64url').toString()));
      const key=this.keys.get(h.kid);if(!key || (key.asymmetricKeyType!=='rsa' || (key.asymmetricKeyDetails?.modulusLength??0)<2048) || !verify('RSA-SHA256',Buffer.from(parts[0]+'.'+parts[1]),key,Buffer.from(parts[2],'base64url'))) throw new Error();
      const c=Claims.parse(JSON.parse(Buffer.from(parts[1],'base64url').toString()));
      const now=Math.floor(this.now()/1000);
      if(c.iss!==this.issuer || c.aud!==this.audience || c.exp<=now || c.iat>now || c.exp<=c.iat || (c.nbf!==undefined && c.nbf>now) || this.directory.sessionActive(c.sub,c.sid)!==true) throw new Error();
      const identity=VerifiedIdentity.issue(c.sub,c.sid,c.exp*1000);this.issued.add(identity);Object.freeze(identity);return identity;
    } catch {throw new GovernanceError('DENIED');}
  }
  authorize(identity:VerifiedIdentity,role:Role) {
    if(!this.issued.has(identity) || identity.expires<=this.now() || this.directory.sessionActive(identity.subject,identity.session)!==true || !this.directory.roles(identity.subject).includes(role)) throw new GovernanceError('DENIED');
  }
}
