/** Serialized as a standalone classic script. Keep the installer free of module dependencies. */
function install(origin: string) {
  const script = document.currentScript as HTMLScriptElement | null;
  const key = script?.getAttribute('data-public-key');
  if (!script || !key || !/^[a-f0-9]{64}$/.test(key) || !script.parentNode) return;
  const frame = document.createElement('iframe'), channel = Array.from(crypto.getRandomValues(new Uint8Array(16)), byte => byte.toString(16).padStart(2, '0')).join('');
  frame.src = `${origin}/embed/${key}`; frame.title = 'Service request form'; frame.loading = 'lazy'; frame.referrerPolicy = 'no-referrer'; frame.width = '100%'; frame.height = '1000'; frame.style.border = '0'; frame.style.display = 'block';
  let retry: ReturnType<typeof setInterval> | undefined, deadline: ReturnType<typeof setTimeout> | undefined;
  const stop = () => { clearInterval(retry); clearTimeout(deadline); };
  const hello = () => frame.contentWindow?.postMessage({ type: 'salesmora.capture.init', version: 1, channel }, origin);
  const listen = (event: MessageEvent) => {
    const data = event.data;
    if (!frame.isConnected) { stop(); window.removeEventListener('message', listen); return; }
    if (event.origin !== origin || event.source !== frame.contentWindow || !data || typeof data !== 'object' || Array.isArray(data) || Object.keys(data).sort().join(',') !== 'channel,height,type,version' || data.type !== 'salesmora.capture.resize' || data.version !== 1 || data.channel !== channel || !Number.isInteger(data.height) || data.height < 128 || data.height > 20000) return;
    frame.height = String(data.height); stop();
  };
  window.addEventListener('message', listen);
  frame.addEventListener('load', () => { stop(); hello(); retry = setInterval(hello, 250); deadline = setTimeout(stop, 10000); });
  script.parentNode.insertBefore(frame, script);
}
export function captureEmbedLoader(origin: string) { return `;(${install.toString()})(${JSON.stringify(origin)});\n`; }
