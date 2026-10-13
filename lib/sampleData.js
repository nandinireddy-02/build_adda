// Sample content for the home page.
// These are placeholders. Later they will be replaced by real rows from the database.

export const categories = [
  "Environment",
  "Education",
  "Healthcare",
  "Mobility",
  "Smart campus",
  "Social impact",
  "Agriculture",
  "Finance",
];

export const steps = [
  {
    title: "Pick a problem",
    text: "Browse problems posted by students, college departments, NGOs, and local businesses.",
  },
  {
    title: "Say you are in",
    text: "Join solo or with your friend group, and see who else is interested and what they can do.",
  },
  {
    title: "Fill the gap",
    text: "Form a team and recruit the one skill you are missing, like a designer or a backend developer.",
  },
  {
    title: "Ship and show",
    text: "Hit your milestones, hand the solution to the person who needed it, and add it to your showcase.",
  },
];

export const problems = [
  {
    id: "food-waste",
    title: "Reduce food waste in college hostels",
    summary:
      "The mess cooks for a fixed headcount every day, so leftovers pile up whenever students eat out.",
    tags: ["Sustainability", "IoT"],
    status: "6 interested",
  },
  {
    id: "campus-transport",
    title: "Smart campus transport system",
    summary:
      "Students wait at stops with no idea when the college bus will arrive or whether it is full.",
    tags: ["Mobility", "AI"],
    status: "Team needs 1 designer",
  },
  {
    id: "genuine-internships",
    title: "Make internships more genuine",
    summary:
      "Students cannot tell which internship listings are real, paid, and worth the time before applying.",
    tags: ["Education", "Web"],
    status: "4 interested",
  },
];
