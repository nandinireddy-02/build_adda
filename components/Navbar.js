import Link from "next/link";
import Logo from "./Logo";
import { getCurrentUser } from "@/lib/auth";
import { unreadCount } from "@/lib/queries";
import { logout } from "@/app/actions/auth";

const links = [
  { href: "/problems", label: "Problems" },
  { href: "/showcase", label: "Showcase" },
  { href: "/problems/new", label: "Post a problem" },
];

const linkClass = "rounded-full px-4 py-3 font-medium text-ink transition-colors hover:bg-white/70";
const ctaClass = "btn3d rounded-full bg-ink px-6 py-3 text-center font-semibold text-neon";

function Bell({ unread }) {
  return (
    <Link
      href="/notifications"
      className={`${linkClass} inline-flex items-center gap-2`}
      aria-label={unread ? `Notifications, ${unread} unread` : "Notifications"}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
        strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
        <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
      </svg>
      {unread > 0 && (
        <span className="min-w-6 rounded-full bg-tangerine px-1.5 text-center text-sm font-semibold text-tangerine-ink" aria-hidden="true">
          {unread > 99 ? "99+" : unread}
        </span>
      )}
    </Link>
  );
}

function AccountLinks({ user, unread, stacked = false }) {
  if (!user) {
    return (
      <>
        <Link href="/login" className={linkClass}>
          Log in
        </Link>
        <Link href="/signup" className={ctaClass}>
          Join Krew
        </Link>
      </>
    );
  }
  return (
    <>
      {!stacked && <Bell unread={unread} />}
      <Link href="/profile" className={linkClass}>
        Profile
      </Link>
      <form action={logout} className={stacked ? "contents" : undefined}>
        <button type="submit" className={`${linkClass} cursor-pointer text-left`}>
          Log out
        </button>
      </form>
      <Link href="/dashboard" className={ctaClass}>
        Dashboard
      </Link>
    </>
  );
}

export default async function Navbar() {
  const user = await getCurrentUser();
  const unread = user ? await unreadCount(user.id) : 0;

  return (
    <div className="sticky top-0 z-40 bg-lilac/80 backdrop-blur-md backdrop-saturate-150">
      <header className="mx-auto flex max-w-[1240px] items-center justify-between gap-4 px-5 py-4 md:px-10">
        <Link href="/" aria-label="Krew home" className="shrink-0">
          <Logo />
        </Link>

        {/* Wide screens: everything in one row. */}
        <nav aria-label="Main" className="hidden items-center gap-1 lg:flex">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className={linkClass}>
              {link.label}
            </Link>
          ))}
          <AccountLinks user={user} unread={unread} />
        </nav>

        {/* Phones and tablets: a menu button that opens a panel. */}
        <div className="flex items-center gap-1 lg:hidden">
          {user && <Bell unread={unread} />}
          <details className="group relative">
            <summary className="flex min-h-12 cursor-pointer list-none items-center gap-2 rounded-full bg-ink px-5 font-semibold text-neon [&::-webkit-details-marker]:hidden">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                strokeLinecap="round" aria-hidden="true">
                <path d="M4 7h16M4 12h16M4 17h16" className="group-open:hidden" />
                <path d="M6 6l12 12M18 6 6 18" className="hidden group-open:block" />
              </svg>
              Menu
            </summary>
            <nav
              aria-label="Main"
              className="slab absolute right-0 top-[calc(100%+12px)] flex w-64 flex-col gap-1 rounded-[24px] bg-white p-3"
            >
              {links.map((link) => (
                <Link key={link.href} href={link.href} className={linkClass}>
                  {link.label}
                </Link>
              ))}
              <div className="my-1 border-t border-line" />
              <AccountLinks user={user} unread={unread} stacked />
            </nav>
          </details>
        </div>
      </header>
    </div>
  );
}
