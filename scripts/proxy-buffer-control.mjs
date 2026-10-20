// Deliberately coalesces the entire isolated test stream; never imported by the app.
import http from 'node:http';
export function startBufferControl() {
  const server = http.createServer((request, response) => {
    if (request.method !== 'POST' || request.url !== '/api/chat/turns') { response.writeHead(404).end(); return; }
    const upstream = http.request({ hostname: '127.0.0.1', port: 3002, path: '/api/chat/turns', method: 'POST', headers: request.headers }, result => {
      const chunks = []; let bytes = 0;
      result.on('data', chunk => { bytes += chunk.length; if (bytes > 64000) upstream.destroy(); else chunks.push(chunk); });
      result.on('end', () => {
        console.log(JSON.stringify({ event: 'proxy-control.completed', status: result.statusCode, bytes }));
        const body = Buffer.concat(chunks);
        const headers = { ...result.headers, 'content-length': String(body.length) };
        delete headers['transfer-encoding'];
        response.writeHead(result.statusCode ?? 502, headers); response.end(body);
      });
      result.on('error', () => response.destroy());
    });
    upstream.on('error', () => { console.error(JSON.stringify({ event: 'proxy-control.failed' })); response.destroy(); });
    upstream.setTimeout(110_000, () => upstream.destroy());
    response.on('close', () => upstream.destroy());
    request.pipe(upstream);
  });
  server.listen(3006, '127.0.0.1');
  return server;
}
