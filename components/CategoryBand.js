import { CATEGORIES } from "@/lib/content";

function Row({ hidden = false }) {
  return (
    <ul className="flex shrink-0 items-center gap-9 pr-9" aria-hidden={hidden || undefined}>
      {CATEGORIES.map((category) => (
        <li key={category} className="flex items-center gap-9">
          <span>{category}</span>
          <span className="text-tangerine" aria-hidden="true">
            /
          </span>
        </li>
      ))}
    </ul>
  );
}

export default function CategoryBand() {
  return (
    // The outer box hides the parts of the tilted band that stick out past the screen edges.
    <div className="overflow-hidden py-5">
      <div className="-mx-10 -rotate-[1.2deg] overflow-hidden bg-ink py-5 text-neon">
        <div className="marquee whitespace-nowrap font-display text-[26px] font-bold">
          <Row />
          <Row hidden />
        </div>
      </div>
    </div>
  );
}
