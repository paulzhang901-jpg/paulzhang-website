import {z} from 'zod';
import {GovernanceError,identifier} from './contracts';
import {IdentityVerifier} from './identity';
import {NarrationGovernance} from './service';

const Command=z.discriminatedUnion('action',[
  z.object({action:z.literal('submit'),request:identifier,source:z.unknown()}).strict(),
  z.object({action:z.literal('review'),request:identifier,job:identifier,decision:z.enum(['approve','reject']),human_listening:z.boolean()}).strict(),
  z.object({action:z.literal('publish'),request:identifier,job:identifier}).strict(),
  z.object({action:z.literal('revoke'),request:identifier,job:identifier}).strict(),
  z.object({action:z.literal('invalidate'),request:identifier,job:identifier}).strict()
]);
/** Framework-neutral server entry point for the separately protected admin runtime; never mounted by Next.js. */
export class AdminBoundary {
  constructor(private verifier:IdentityVerifier,private service:NarrationGovernance) {}
  execute(bearer:string,input:unknown) {
    if(typeof bearer!=='string' || !bearer.startsWith('Bearer ')) throw new GovernanceError('DENIED');
    const actor=this.verifier.authenticate(bearer.slice(7));const c=Command.parse(input);
    switch(c.action) {
      case 'submit':return this.service.submit(actor,c.request,c.source);
      case 'review':return this.service.review(actor,c.request,c.job,c.decision,c.human_listening);
      case 'publish':return this.service.publish(actor,c.request,c.job);
      case 'revoke':return this.service.revoke(actor,c.request,c.job);
      case 'invalidate':return this.service.invalidate(actor,c.request,c.job);
    }
  }
}
