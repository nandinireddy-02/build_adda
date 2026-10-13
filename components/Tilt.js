"use client";

import { useRef } from "react";

// Wrap anything in <Tilt> to make it lean toward the mouse in 3D.
// "max" is the largest tilt angle in degrees. Touch screens are left alone.
export default function Tilt({ children, max = 10, className = "", ...rest }) {
  const ref = useRef(null);

  function handleMove(event) {
    if (event.pointerType === "touch") return;
    const box = ref.current.getBoundingClientRect();
    const x = (event.clientX - box.left) / box.width - 0.5;
    const y = (event.clientY - box.top) / box.height - 0.5;
    ref.current.style.setProperty("--ry", `${(x * max * 2).toFixed(2)}deg`);
    ref.current.style.setProperty("--rx", `${(-y * max * 2).toFixed(2)}deg`);
    ref.current.style.setProperty("--mx", `${((x + 0.5) * 100).toFixed(1)}%`);
    ref.current.style.setProperty("--my", `${((y + 0.5) * 100).toFixed(1)}%`);
  }

  function handleLeave() {
    ref.current.style.setProperty("--ry", "0deg");
    ref.current.style.setProperty("--rx", "0deg");
  }

  return (
    <div
      ref={ref}
      onPointerMove={handleMove}
      onPointerLeave={handleLeave}
      className={`tilt ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
}
