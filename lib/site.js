// The public address of the site, used for canonical links, the sitemap, and
// link previews. Set NEXT_PUBLIC_SITE_URL in .env.local once the site is live.
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");

export const SITE_NAME = "Krew";

export const SITE_DESCRIPTION =
  "Krew connects college students with real problems from people, departments, NGOs, and local businesses. Find a problem, form a team with the skills you're missing, and ship something people use.";
