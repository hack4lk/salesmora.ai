// Local container-only rehearsal. No configured database, provider, DNS or Railway access.
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { randomBytes, randomUUID } from 'node:crypto';
import { mkdirSync, mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
const id = randomUUID().replaceAll('-', ''), network = `capture-gateway-${id}`, backend = `capture-backend-${id}`, gateway = `capture-ingress-${id}`, directory = mkdtempSync(join(tmpdir(), 'capture-gateway-'));
const dockerConfig = join(directory, 'docker'); mkdirSync(dockerConfig); writeFileSync(join(dockerConfig, 'config.json'), '{"auths":{}}', { mode: 0o600 });
const dockerEnv = { ...process.env, DOCKER_CONFIG: dockerConfig, DOCKER_BUILDKIT: '0' };
const image = 'salesmora-forms-gateway:rehearsal', file = join(directory, 'runtime.env'), key = randomBytes(32).toString('base64');
const docker = args => execFileSync('docker', args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], env: dockerEnv }).trim();
const fixture = `import {createServer} from 'node:http';createServer(async(req,res)=>{let size=0;for await(const part of req)size+=part.length;res.setHeader('Content-Type','application/json');res.setHeader('Set-Cookie','private=fixture');res.end(JSON.stringify({host:req.headers.host,ip:req.headers['x-real-ip'],cookie:!!req.headers.cookie,auth:!!req.headers.authorization,xff:!!req.headers['x-forwarded-for'],keyMatches:req.headers['x-capture-ingress-key']===process.env.CAPTURE_INGRESS_SECRET,bytes:size}));}).listen(8081,'0.0.0.0');`;
let created = false;
try {
  writeFileSync(file, `CAPTURE_PUBLIC_ORIGIN=https://forms.salesmora.ai\nCAPTURE_UPSTREAM_URL=http://web.railway.internal:8081\nCAPTURE_INGRESS_SECRET=${key}\nCAPTURE_GATEWAY_EDGE=railway\n`, { mode: 0o600 });
  execFileSync('docker', ['build', '-f', 'infra/railway/forms-gateway.Dockerfile', '-t', image, '.'], { stdio: 'inherit', env: dockerEnv });
  docker(['network', 'create', '--internal', network]); created = true;
  docker(['run', '-d', '--name', backend, '--network', network, '--network-alias', 'web.railway.internal', '--env-file', file, image, 'node', '--input-type=module', '-e', fixture]);
  docker(['run', '-d', '--name', gateway, '--network', network, '--env-file', file, image]);
  const client = `import assert from 'node:assert/strict';import {request} from 'node:http';const origin='http://${gateway}:8080';for(let attempt=0;;attempt++){try{if((await fetch(origin+'/healthz')).ok)break;}catch{}if(attempt>=30)throw Error('Gateway did not become live.');await new Promise(resolve=>setTimeout(resolve,100));}const send=(path,method,headers,payload='')=>new Promise((resolve,reject)=>{const req=request(new URL(path,origin),{method,headers},res=>{let body='';res.on('data',part=>body+=part);res.on('end',()=>resolve({status:res.statusCode,headers:res.headers,body}));});req.on('error',reject);req.end(payload);});const response=await send('/api/public/capture/'+'a'.repeat(64),'POST',{Host:'forms.salesmora.ai',Origin:'https://forms.salesmora.ai','Content-Type':'application/json','X-Real-IP':'198.51.100.7','X-Forwarded-Proto':'https','X-Railway-Edge':'fixture',Cookie:'session=fixture',Authorization:'Bearer fixture','X-Capture-Ingress-Key':'visitor-forgery','X-Forwarded-For':'203.0.113.99'},'{}');assert.equal(response.status,200);assert.equal(response.headers['set-cookie'],undefined);assert.deepEqual(JSON.parse(response.body),{host:'forms.salesmora.ai',ip:'198.51.100.7',cookie:false,auth:false,xff:false,keyMatches:true,bytes:2});assert.equal((await send('/api/auth/get-session','GET',{Host:'forms.salesmora.ai'})).status,404);`;
  docker(['run', '--rm', '--network', network, image, 'node', '--input-type=module', '-e', client]);
  assert.equal(docker(['inspect', '--format', '{{.Config.User}}', gateway]), 'node');
  docker(['stop', '--time', '40', gateway]); assert.equal(docker(['inspect', '--format', '{{.State.ExitCode}}', gateway]), '0');
  console.log('PASS production-mode gateway container: private upstream, header isolation, route denial, unprivileged user and graceful shutdown.');
} finally {
  for (const name of [gateway, backend]) { try { docker(['rm', '-f', name]); } catch {} }
  if (created) { try { docker(['network', 'rm', network]); } catch {} }
  rmSync(directory, { recursive: true, force: true });
}
