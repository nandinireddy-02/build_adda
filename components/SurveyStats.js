import CountUp from "./CountUp";
import Reveal from "./Reveal";
import Tilt from "./Tilt";

// Results from our October 2026 survey of 48 college students.
const stats = [
  { value: 79, text: "built their last project for marks or an event. Nobody outside the team used it." },
  { value: 90, text: "said their team was missing a skill the project needed." },
  { value: 29, text: "said the hardest part was teammates not pulling their weight, the top answer." },
  { value: 88, text: "have worked with someone new, or would, if the project was right." },
];

export default function SurveyStats() {
  return (
    <section aria-labelledby="survey-heading" className="mx-auto max-w-[1240px] px-5 pb-[104px] md:px-10">
      <Reveal>
        <h2
          id="survey-heading"
          className="mb-4 max-w-[760px] font-display text-[clamp(36px,5vw,64px)] font-extrabold leading-none tracking-[-0.03em]"
        >
          We asked 48 students about their last project
        </h2>
        <p className="mb-12 max-w-[640px] text-lg text-soft">
          Krew is built around what they told us: real users, the missing skill, and teammates who deliver.
        </p>
      </Reveal>

      <ul className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-x-5 gap-y-8">
        {stats.map((stat, index) => (
          <Reveal as="li" key={stat.text} delay={index * 90}>
            <Tilt
              max={8}
              className={`slab spotlight h-full rounded-[32px] p-7 ${index === 0 ? "slab-ink bg-ink text-white" : "bg-white"}`}
            >
              <p
                className={`pop-md mb-3 font-display text-6xl font-extrabold leading-none ${
                  index === 0 ? "text-neon" : "text-krew"
                }`}
              >
                <CountUp value={stat.value} suffix="%" />
              </p>
              <p className={index === 0 ? "text-mist" : "text-muted"}>{stat.text}</p>
            </Tilt>
          </Reveal>
        ))}
      </ul>
    </section>
  );
}
