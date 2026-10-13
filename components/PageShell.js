import Link from "next/link";
import Navbar from "./Navbar";
import Logo from "./Logo";

// Header, page body, and a light footer for every page except the home page.
export default function PageShell({ children }) {
  return (
    <>
      <Navbar />
      <main id="main" className="mx-auto max-w-[1240px] px-5 pb-24 pt-6 md:px-10">{children}</main>
      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-[1240px] flex-wrap items-center justify-between gap-4 px-5 py-8 text-muted md:px-10">
          <Link href="/" aria-label="Krew home">
            <Logo size="sm" />
          </Link>
          <p className="text-[15px]">Where problems meet their people.</p>
        </div>
      </footer>
    </>
  );
}
