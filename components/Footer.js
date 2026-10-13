import Link from "next/link";
import Logo from "./Logo";

const links = [
  { href: "/problems", label: "Problems" },
  { href: "/showcase", label: "Showcase" },
  { href: "/problems/new", label: "Post a problem" },
];

export default function Footer() {
  return (
    <footer className="mx-auto flex max-w-[1240px] flex-wrap items-center justify-between gap-5 px-5 pb-12 text-mist md:px-10">
      <Logo onDark size="sm" />
      <p className="text-[15px]">Where problems meet their people.</p>
      <nav aria-label="Footer" className="flex flex-wrap gap-1">
        {links.map((link) => (
          <Link key={link.href} href={link.href} className="p-3 text-white underline-offset-4 hover:underline">
            {link.label}
          </Link>
        ))}
      </nav>
    </footer>
  );
}
