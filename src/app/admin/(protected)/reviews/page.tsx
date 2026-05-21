import Link from "next/link";
import { ExternalLink, MessageSquare } from "lucide-react";

import { ConfirmDeleteButton } from "@/components/confirm-delete-button";
import { Rating } from "@/components/rating";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { deleteReviewAction } from "@/server-actions/admin";

export const metadata = { title: "Admin · Reviews" };

const DATE_FMT = new Intl.DateTimeFormat("en-GB", {
  year: "numeric",
  month: "short",
  day: "numeric",
});

export default async function AdminReviewsPage() {
  const supabase = await createSupabaseServerClient();
  const { data: reviews } = await supabase
    .from("reviews")
    .select("id, title, body, rating, difficulty, workload_hours, created_at, author_id, course_id, courses(code, title)")
    .order("created_at", { ascending: false });

  const authorIds = Array.from(
    new Set((reviews ?? []).map((r) => r.author_id)),
  );
  const emailByAuthor = new Map<string, string>();
  if (authorIds.length > 0) {
    const adminClient = createSupabaseAdminClient();
    const { data } = await adminClient.auth.admin.listUsers({
      page: 1,
      perPage: 200,
    });
    for (const u of data.users) {
      if (authorIds.includes(u.id) && u.email) {
        emailByAuthor.set(u.id, u.email);
      }
    }
  }

  const rows = reviews ?? [];

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Reviews
        </h1>
        <p className="text-sm text-muted-foreground">
          {rows.length} review{rows.length === 1 ? "" : "s"} published.
        </p>
      </div>

      {rows.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border bg-card p-10 text-center">
          <MessageSquare size={24} className="mx-auto text-muted-foreground" />
          <h2 className="mt-2 text-base font-semibold text-foreground">
            No reviews yet
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Reviews appear here as soon as students publish them.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {rows.map((r) => (
            <article
              key={r.id}
              className="rounded-lg border border-border bg-card p-5"
            >
              <header className="flex flex-wrap items-start justify-between gap-2 border-b border-border pb-3">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-base font-semibold text-foreground">
                      {r.title}
                    </h3>
                    {r.courses?.code && (
                      <Link
                        href={`/courses/${r.courses.code}`}
                        target="_blank"
                        className="inline-flex items-center gap-1 rounded-md border border-border px-1.5 py-0.5 font-mono text-xs text-muted-foreground hover:bg-secondary"
                      >
                        {r.courses.code}
                        <ExternalLink size={10} />
                      </Link>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    <span className="font-mono">
                      {emailByAuthor.get(r.author_id) ?? "unknown@"}
                    </span>
                    {" · "}
                    {DATE_FMT.format(new Date(r.created_at))}
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <Rating value={r.rating} size="md" />
                  <ConfirmDeleteButton
                    title="Delete this review?"
                    description="The review will be permanently removed. The student will be able to submit a new one."
                    action={async () => deleteReviewAction(r.id)}
                    successMessage="Review deleted."
                  />
                </div>
              </header>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-foreground">
                {r.body}
              </p>
              <dl className="mt-4 flex gap-5 border-t border-border pt-3 text-xs">
                <div>
                  <dt className="text-[10px] uppercase tracking-wide text-muted-foreground">
                    Difficulty
                  </dt>
                  <dd className="mt-0.5 font-medium tabular-nums">
                    {r.difficulty.toFixed(1)} / 5
                  </dd>
                </div>
                <div>
                  <dt className="text-[10px] uppercase tracking-wide text-muted-foreground">
                    Workload
                  </dt>
                  <dd className="mt-0.5 font-medium tabular-nums">
                    {r.workload_hours} h/wk
                  </dd>
                </div>
              </dl>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
