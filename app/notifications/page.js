import Link from "next/link";
import PageShell from "@/components/PageShell";
import SubmitButton from "@/components/SubmitButton";
import EmptyState from "@/components/EmptyState";
import { requireUser } from "@/lib/auth";
import { listNotifications } from "@/lib/queries";
import { markAllRead } from "@/app/actions/notifications";
import { cardClass, pageTitle, quietButton } from "@/lib/ui";

export const metadata = { title: "Notifications", robots: { index: false } };

function timeAgo(date) {
  const minutes = Math.round((Date.now() - new Date(date).getTime()) / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} h ago`;
  return new Date(date).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

export default async function NotificationsPage() {
  const user = await requireUser("/notifications");
  const items = await listNotifications(user.id);
  const unread = items.filter((n) => !n.read_at).length;

  return (
    <PageShell>
      <div className="mx-auto max-w-[760px]">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className={pageTitle}>Notifications</h1>
            <p className="mt-3 text-lg text-soft">{unread ? `${unread} unread` : "You're all caught up."}</p>
          </div>
          {unread > 0 && (
            <form action={markAllRead}>
              <SubmitButton pendingText="Marking…" className={quietButton}>
                Mark all as read
              </SubmitButton>
            </form>
          )}
        </div>

        {items.length === 0 ? (
          <EmptyState title="Nothing yet">
            You&apos;ll hear here when someone joins your team, shows interest in your problem, gives you a milestone,
            or endorses you.
          </EmptyState>
        ) : (
          <ul className={cardClass}>
            {items.map((n) => (
              <li key={n.id} className="flex items-start gap-3 border-b border-line py-4 first:pt-0 last:border-b-0 last:pb-0">
                <span
                  className={`mt-2 h-2.5 w-2.5 shrink-0 rounded-full ${n.read_at ? "bg-transparent" : "bg-tangerine"}`}
                  aria-hidden="true"
                />
                <div className="min-w-0 flex-1">
                  <p className={n.read_at ? "text-muted" : "font-semibold"}>
                    {n.link ? (
                      <Link href={n.link} className="hover:underline">
                        {n.message}
                      </Link>
                    ) : (
                      n.message
                    )}
                    {!n.read_at && <span className="sr-only"> (unread)</span>}
                  </p>
                  <p className="text-sm text-muted">{timeAgo(n.created_at)}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </PageShell>
  );
}
