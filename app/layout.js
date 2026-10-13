import "./globals.css";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site";

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Krew: find your krew, fix something real",
    template: `%s · ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: [
    "student projects",
    "college project ideas",
    "real world problems",
    "find teammates",
    "hackathon team",
    "final year project",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: "Krew: find your krew, fix something real",
    description: SITE_DESCRIPTION,
    url: "/",
    locale: "en_IN",
  },
  twitter: {
    card: "summary_large_image",
    title: "Krew: find your krew, fix something real",
    description: SITE_DESCRIPTION,
  },
  robots: { index: true, follow: true },
};

// Every page reads the logged-in user or live data, so render on each request
// instead of at build time. This also lets "npm run build" work without a database.
export const dynamic = "force-dynamic";

export const viewport = {
  themeColor: "#2a0e4f",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500;12..96,700;12..96,800&family=Instrument+Sans:wght@400;500;600&display=swap"
        />
      </head>
      <body className="overflow-x-hidden antialiased">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-ink focus:px-5 focus:py-3 focus:text-neon"
        >
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
