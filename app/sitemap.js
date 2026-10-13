import { SITE_URL } from "@/lib/site";

// Built on request so new problems, teams, and profiles appear without a rebuild.
export const dynamic = "force-dynamic";

export default async function sitemap() {
  const now = new Date();
  const pages = [
    { url: `${SITE_URL}/`, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/problems`, lastModified: now, changeFrequency: "hourly", priority: 0.9 },
    { url: `${SITE_URL}/showcase`, lastModified: now, changeFrequency: "daily", priority: 0.8 },
    { url: `${SITE_URL}/signup`, lastModified: now, changeFrequency: "yearly", priority: 0.5 },
  ];

  try {
    const { listAllForSitemap } = await import("@/lib/queries");
    const [problems, teams, people] = await listAllForSitemap();
    return [
      ...pages,
      ...problems.map((p) => ({ url: `${SITE_URL}/problems/${p.id}`, lastModified: p.created_at, priority: 0.7 })),
      ...teams.map((t) => ({ url: `${SITE_URL}/teams/${t.id}`, lastModified: t.created_at, priority: 0.5 })),
      ...people.map((u) => ({ url: `${SITE_URL}/people/${u.id}`, lastModified: u.created_at, priority: 0.4 })),
    ];
  } catch (error) {
    console.error("Sitemap couldn't read the database:", error.message);
    return pages;
  }
}
