import { STEPS as steps } from "@/lib/content";
import Reveal from "./Reveal";
import Tilt from "./Tilt";

const icons = [
  // Pick a problem: magnifier
  <path key="a" d="M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15ZM16 16l5 5" />,
  // Say you're in: raised hand
  <path key="b" d="M8 13V5.5a1.5 1.5 0 0 1 3 0V11m0-6.5a1.5 1.5 0 0 1 3 0V11m0-5a1.5 1.5 0 0 1 3 0v7a8 8 0 0 1-8 8h-.5a6 6 0 0 1-5-2.7L3 14.5a1.5 1.5 0 0 1 2.5-1.6L8 15" />,
  // Fill the gap: puzzle piece
  <path key="c" d="M4 7h4a2 2 0 1 1 4 0h4v4a2 2 0 1 1 0 4v4h-4a2 2 0 1 0-4 0H4v-4a2 2 0 1 0 0-4Z" />,
  // Ship and show: rocket
  <path key="d" d="M5 15c-1.5 1.5-2 5-2 5s3.5-.5 5-2m-1-4 3 3m-5-1 2-6 8-6c2-1 4-1 4-1s0 2-1 4l-6 8-6 2Zm10-6a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z" />,
];

export default function HowItWorks() {
  return (
    <section id="how" className="mx-auto max-w-[1240px] px-5 pb-[88px] pt-[104px] md:px-10">
      <Reveal>
        <h2 className="mb-12 max-w-[760px] font-display text-[clamp(36px,5vw,64px)] font-extrabold leading-none tracking-[-0.03em]">
          From &ldquo;we need a topic&rdquo; to a project people use
        </h2>
      </Reveal>

      <ol className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-x-5 gap-y-8">
        {steps.map((step, index) => {
          const isLast = index === steps.length - 1;
          return (
            <Reveal as="li" key={step.title} delay={index * 90}>
              <Tilt
                max={8}
                className={`slab spotlight h-full rounded-[32px] p-7 ${isLast ? "slab-ink bg-ink text-white" : "bg-white"}`}
              >
                <div className="pop-md mb-6 flex items-center justify-between" aria-hidden="true">
                  <span
                    className={`flex h-14 w-14 items-center justify-center rounded-2xl ${
                      isLast ? "bg-neon text-ink" : "bg-ink text-neon"
                    } shadow-[0_6px_0_#12052a]`}
                  >
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                      strokeLinecap="round" strokeLinejoin="round">
                      {icons[index]}
                    </svg>
                  </span>
                  <span className={`font-display text-6xl font-extrabold leading-none ${isLast ? "text-neon" : "text-ghost"}`}>
                    {index + 1}
                  </span>
                </div>
                <h3 className="pop-sm mb-2 font-display text-2xl font-bold">{step.title}</h3>
                <p className={isLast ? "text-mist" : "text-muted"}>{step.text}</p>
              </Tilt>
            </Reveal>
          );
        })}
      </ol>
    </section>
  );
}
