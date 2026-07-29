import { h, useEffect, useRef, useState } from "../lib/dom.js";

const COLORS = ["#111111", "#ffffff", "#ef4444", "#f59e0b", "#22c55e", "#0a84ff", "#8b5cf6", "#ec4899"];

export function PaintApp() {
  const canvasRef = useRef(null);
  const drawingRef = useRef(false);
  const previousRef = useRef(null);
  const [color, setColor] = useState("#111111");
  const [size, setSize] = useState(5);
  const [hasDrawing, setHasDrawing] = useState(false);
  const context = () => canvasRef.current?.getContext("2d");
  const point = event => {
    const rect = canvasRef.current.getBoundingClientRect();
    return { x: (event.clientX - rect.left) * canvasRef.current.width / rect.width, y: (event.clientY - rect.top) * canvasRef.current.height / rect.height };
  };
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const resize = () => {
      const image = canvas.toDataURL();
      canvas.width = Math.max(1, Math.round(canvas.clientWidth * devicePixelRatio));
      canvas.height = Math.max(1, Math.round(canvas.clientHeight * devicePixelRatio));
      const ctx = canvas.getContext("2d");
      ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, canvas.width, canvas.height);
      if (hasDrawing) { const saved = new Image(); saved.onload = () => ctx.drawImage(saved, 0, 0, canvas.width, canvas.height); saved.src = image; }
    };
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);
  const start = event => { event.preventDefault(); drawingRef.current = true; previousRef.current = point(event); canvasRef.current.setPointerCapture?.(event.pointerId); };
  const draw = event => {
    if (!drawingRef.current) return;
    const next = point(event); const ctx = context();
    ctx.strokeStyle = color; ctx.lineWidth = size * devicePixelRatio; ctx.lineCap = "round"; ctx.lineJoin = "round";
    ctx.beginPath(); ctx.moveTo(previousRef.current.x, previousRef.current.y); ctx.lineTo(next.x, next.y); ctx.stroke();
    previousRef.current = next; setHasDrawing(true);
  };
  const stop = () => { drawingRef.current = false; previousRef.current = null; };
  const clear = () => { const canvas = canvasRef.current; const ctx = context(); ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, canvas.width, canvas.height); setHasDrawing(false); };
  const download = () => { const link = document.createElement("a"); link.href = canvasRef.current.toDataURL("image/png"); link.download = "WebOS drawing.png"; link.click(); };
  return h("div", { className: "paint-app" },
    h("div", { className: "paint-toolbar" },
      h("div", { className: "paint-colors", "aria-label": "Brush color" }, ...COLORS.map(value => h("button", { type: "button", key: value, className: `paint-color ${color === value ? "paint-color--active" : ""}`, style: { background: value }, onClick: () => setColor(value), "aria-label": `Use ${value}` }))),
      h("label", { className: "paint-size" }, "Size", h("input", { type: "range", min: 1, max: 28, value: size, onChange: event => setSize(Number(event.target.value)) }), h("span", null, size)),
      h("div", { className: "paint-actions" }, h("button", { type: "button", className: "app-toolbar-chip", onClick: clear }, "Clear"), h("button", { type: "button", className: "app-toolbar-chip", onClick: download, disabled: !hasDrawing }, "Save PNG"))
    ),
    h("div", { className: "paint-canvas-wrap" }, h("canvas", { ref: canvasRef, className: "paint-canvas", onPointerDown: start, onPointerMove: draw, onPointerUp: stop, onPointerCancel: stop, onPointerLeave: stop }))
  );
}
