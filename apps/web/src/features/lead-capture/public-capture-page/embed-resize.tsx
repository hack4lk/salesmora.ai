'use client';
import { useEffect } from 'react';
/** Answer-free handshake; the loader independently authenticates the child window and origin. */
export function CaptureEmbedResize() {
  useEffect(() => {
    if (window.parent === window) return;
    let target: { origin: string; channel: string } | undefined, pending = 0;
    const send = () => {
      pending = 0; const main = document.querySelector('main'); if (!target || !main) return;
      const height = Math.max(128, Math.min(20000, Math.ceil(main.getBoundingClientRect().height)));
      window.parent.postMessage({ type: 'salesmora.capture.resize', version: 1, channel: target.channel, height }, target.origin);
    };
    const measure = () => { if (!pending) pending = requestAnimationFrame(send); };
    const listen = (event: MessageEvent) => {
      const data = event.data;
      if (event.source !== window.parent || !/^https?:\/\//.test(event.origin) || !data || typeof data !== 'object' || Array.isArray(data) || Object.keys(data).sort().join(',') !== 'channel,type,version' || data.type !== 'salesmora.capture.init' || data.version !== 1 || typeof data.channel !== 'string' || !/^[a-f0-9]{32}$/.test(data.channel)) return;
      target = { origin: event.origin, channel: data.channel }; measure();
    };
    const observer = new ResizeObserver(measure), main = document.querySelector('main'); if (main) observer.observe(main);
    window.addEventListener('message', listen); window.addEventListener('resize', measure);
    return () => { observer.disconnect(); cancelAnimationFrame(pending); window.removeEventListener('message', listen); window.removeEventListener('resize', measure); };
  }, []);
  return null;
}
