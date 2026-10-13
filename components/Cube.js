// A spinning 3D cube made of six coloured faces. Decorative only.
// size: edge length in pixels. color: any CSS colour.
export default function Cube({ size = 64, color = "#b6ff3b", className = "" }) {
  return (
    <div className={`cube-wrap ${className}`} aria-hidden="true">
      <div className="cube" style={{ "--s": `${size}px`, "--face": color }}>
        <span />
        <span />
        <span />
        <span />
        <span />
        <span />
      </div>
    </div>
  );
}
