import { describe, it, expect } from 'vitest';
import { captureProposeToolParameters, captureSourceInputSchema } from './assistant-sources';
import { resolveCaptureLocalTime } from './timing';
const base={operation:'pause',sourceId:null,name:null,configurationKind:null,timing:null};
describe('source proposal input and strict wire contracts',()=>{
  it('keeps all model objects strict, all fields required, and unsupported schema constructs out',()=>{
    const inspect=(value:unknown)=>{if(!value||typeof value!=='object')return;expect(value).not.toHaveProperty('oneOf');expect(value).not.toHaveProperty('format','uri');expect(value).not.toHaveProperty('default');if('type'in value&&value.type==='object'&&'properties'in value){expect(value).toHaveProperty('additionalProperties',false);expect(value).toHaveProperty('required',Object.keys(value.properties as object));}for(const child of Object.values(value))inspect(child);};inspect(captureProposeToolParameters);
  });
  it('binds a source action without accepting caller authority or configuration payloads',()=>{
    expect(captureSourceInputSchema.safeParse(base).success).toBe(true);
    expect(captureSourceInputSchema.safeParse({...base,ready:true}).success).toBe(false);
    expect(captureSourceInputSchema.safeParse({...base,name:'Unexpected rename'}).success).toBe(false);
    expect(captureSourceInputSchema.safeParse({...base,operation:'duplicate'}).success).toBe(false);
    expect(captureSourceInputSchema.safeParse({...base,operation:'duplicate',name:'Reviewed copy',configurationKind:'approved'}).success).toBe(true);
  });
  it('requires a wall-clock value for scheduled actions and rejects unused timing input',()=>{
    expect(captureSourceInputSchema.safeParse({...base,operation:'publish'}).success).toBe(false);
    expect(captureSourceInputSchema.safeParse({...base,operation:'publish',timing:{kind:'now',localDateTime:null}}).success).toBe(true);
    expect(captureSourceInputSchema.safeParse({...base,operation:'change_schedule',timing:{kind:'scheduled',localDateTime:null}}).success).toBe(false);
    expect(captureSourceInputSchema.safeParse({...base,timing:{kind:'now',localDateTime:null}}).success).toBe(false);
  });
  it('resolves wall time in the workspace zone and refuses DST gaps and folds',()=>{
    expect(resolveCaptureLocalTime('2030-01-01T09:00','America/New_York')).toEqual({at:'2030-01-01T14:00:00.000Z'});
    expect(resolveCaptureLocalTime('2027-03-14T02:30','America/New_York')).toEqual({error:'gap'});
    expect(resolveCaptureLocalTime('2027-11-07T01:30','America/New_York')).toEqual({error:'ambiguous'});
    expect(resolveCaptureLocalTime('2027-02-30T10:00','America/New_York')).toEqual({error:'date'});
  });
});
