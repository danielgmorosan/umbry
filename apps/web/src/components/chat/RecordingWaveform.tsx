import { useEffect, useRef } from "react";

/**
 * Live mic waveform during recording (T3). Taps the capture stream with a
 * WebAudio AnalyserNode and scrolls a real-time amplitude trace across a
 * canvas - the accent-colored line reacts to your voice (inspiration: the
 * orange recording wave). Purely decorative; cleans up on unmount.
 */
export function RecordingWaveform({ stream, className }: { stream: MediaStream | null; className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!stream) return;
    const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return;
    const ctx = new Ctor();
    const source = ctx.createMediaStreamSource(stream);
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 1024;
    analyser.smoothingTimeConstant = 0.8;
    source.connect(analyser);
    const data = new Uint8Array(analyser.frequencyBinCount);

    // Rolling history of recent amplitudes for a scrolling trace.
    const history: number[] = [];
    let raf = 0;
    const accent = getComputedStyle(document.documentElement).getPropertyValue("--st-positive").trim() || "#22c55e";

    const draw = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const dpr = window.devicePixelRatio || 1;
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
        canvas.width = w * dpr;
        canvas.height = h * dpr;
      }
      const c = canvas.getContext("2d")!;
      c.setTransform(dpr, 0, 0, dpr, 0, 0);
      c.clearRect(0, 0, w, h);

      analyser.getByteTimeDomainData(data);
      // RMS amplitude of this frame → one history sample.
      let sum = 0;
      for (let i = 0; i < data.length; i++) {
        const v = (data[i] - 128) / 128;
        sum += v * v;
      }
      const rms = Math.sqrt(sum / data.length);
      const cols = Math.max(24, Math.floor(w / 4));
      history.push(rms);
      while (history.length > cols) history.shift();

      const mid = h / 2;
      const step = w / cols;
      c.lineWidth = 2;
      c.lineCap = "round";
      c.strokeStyle = accent;
      c.beginPath();
      for (let i = 0; i < history.length; i++) {
        const x = i * step;
        const amp = Math.min(1, history[i] * 3.2) * (h / 2 - 2);
        c.moveTo(x, mid - amp);
        c.lineTo(x, mid + amp);
      }
      c.stroke();
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      source.disconnect();
      void ctx.close();
    };
  }, [stream]);

  return <canvas ref={canvasRef} className={className} />;
}
