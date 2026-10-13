// The home page teaser form. It hands the three answers to the full
// "Post a problem" page, which asks for the rest and saves it.

const questions = [
  { name: "who", label: "Who has this problem?", placeholder: "Hostel mess staff and 400 residents" },
  { name: "today", label: "What happens today?", placeholder: "Food is cooked for everyone, half is thrown away" },
  { name: "solved", label: "What would solved look like?", placeholder: "The mess knows the headcount by 4 pm" },
];

export default function PostProblemForm() {
  return (
    <form
      action="/problems/new"
      method="get"
      className="slab slab-ink flex min-w-0 flex-[1_1_420px] flex-col gap-[18px] rounded-[32px] bg-white p-8 text-ink lg:rotate-1"
    >
      {questions.map((question) => (
        <div key={question.name} className="flex flex-col gap-1.5">
          <label htmlFor={`home-${question.name}`} className="font-semibold">
            {question.label}
          </label>
          <input
            id={`home-${question.name}`}
            name={question.name}
            type="text"
            maxLength={300}
            placeholder={question.placeholder}
            className="min-h-12 rounded-2xl border-2 border-line px-4 py-3.5 text-ink placeholder:text-muted/70 focus:border-ink focus:outline-none"
          />
        </div>
      ))}

      <button
        type="submit"
        className="btn3d btn3d-neon min-h-[52px] cursor-pointer rounded-full bg-neon px-6 py-4 text-lg font-semibold text-neon-ink"
      >
        Continue
      </button>
      <p className="text-sm text-muted">Next you&apos;ll add a title and category. You&apos;ll need to log in to post.</p>
    </form>
  );
}
