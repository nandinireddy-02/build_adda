import Cube from "./Cube";

// A friendly empty screen with a small cluster of floating 3D blocks.
export default function EmptyState({ title, children, action }) {
  return (
    <div className="slab flex flex-wrap items-center gap-8 rounded-[32px] bg-white p-8 md:p-10">
      <div className="relative h-28 w-36 shrink-0" aria-hidden="true">
        <Cube size={56} color="#b6ff3b" className="bob absolute left-2 top-4" />
        <Cube size={36} color="#0be8f0" className="bob-slow absolute right-2 top-0" />
        <Cube size={28} color="#ff7a1a" className="bob-fast absolute bottom-0 right-8" />
      </div>
      <div className="min-w-0 flex-[1_1_280px]">
        <h2 className="mb-2 font-display text-2xl font-bold">{title}</h2>
        {children && <div className="mb-5 text-lg text-soft">{children}</div>}
        {action}
      </div>
    </div>
  );
}
