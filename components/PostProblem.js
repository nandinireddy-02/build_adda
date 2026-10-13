import PostProblemForm from "./PostProblemForm";

export default function PostProblem() {
  return (
    <div
      id="post"
      className="mx-auto flex max-w-[1240px] scroll-mt-6 flex-wrap items-center gap-14 px-5 py-24 md:px-10"
    >
      <div className="min-w-0 flex-[1_1_440px]">
        <p className="mb-6 inline-block -rotate-2 rounded-full bg-tangerine px-4 py-1.5 text-sm font-semibold text-tangerine-ink">
          NGOs, departments, local businesses
        </p>
        <h2 className="mb-5 font-display text-[clamp(36px,5vw,68px)] font-extrabold leading-[0.98] tracking-[-0.03em]">
          Got a problem nobody is <span className="text-neon">solving</span>?
        </h2>
        <p className="max-w-[480px] text-xl text-mist">
          Answer three questions. Students who want real work will pick it up, and you get a say in
          whether it is solved.
        </p>
      </div>

      <PostProblemForm />
    </div>
  );
}
