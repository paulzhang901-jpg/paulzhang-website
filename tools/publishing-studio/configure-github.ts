import fs from 'node:fs/promises';import path from 'node:path';import {nativeHelper} from './native-auth';import {run} from './process';import {dataRoot} from './credentials';
const helper=await nativeHelper();
try {
 const output=await run(helper,['authorize'],process.cwd(),undefined,600000);
 const evidence=JSON.parse(output);
 await fs.appendFile(path.join(dataRoot(),'auth-evidence.jsonl'),JSON.stringify(evidence)+'\n',{mode:0o600});
 console.log(JSON.stringify(evidence));
}catch {console.error('Authorization cancelled or failed. No token is included in diagnostics.');process.exitCode=1;}
