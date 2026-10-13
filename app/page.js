import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import CategoryBand from "@/components/CategoryBand";
import HowItWorks from "@/components/HowItWorks";
import SurveyStats from "@/components/SurveyStats";
import ProblemFeed from "@/components/ProblemFeed";
import PostProblem from "@/components/PostProblem";
import JoinBanner from "@/components/JoinBanner";
import Footer from "@/components/Footer";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site";

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
      logo: `${SITE_URL}/icon.svg`,
      description: SITE_DESCRIPTION,
    },
    {
      "@type": "WebSite",
      name: SITE_NAME,
      url: SITE_URL,
      potentialAction: {
        "@type": "SearchAction",
        target: `${SITE_URL}/problems?q={search_term_string}`,
        "query-input": "required name=search_term_string",
      },
    },
  ],
};

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }}
      />
      <Navbar />
      <main id="main">
        <Hero />
        <CategoryBand />
        <HowItWorks />
        <SurveyStats />
        <ProblemFeed />
        <section className="rounded-t-[56px] bg-ink text-white">
          <PostProblem />
          <JoinBanner />
          <Footer />
        </section>
      </main>
    </>
  );
}
