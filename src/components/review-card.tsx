import { Rating } from "@/components/rating";

export type ReviewCardData = {
  id: string;
  title: string;
  body: string;
  rating: number;
  difficulty: number;
  workload_hours: number;
  created_at: string;
};

const DATE_FMT = new Intl.DateTimeFormat("en-GB", {
  year: "numeric",
  month: "short",
  day: "numeric",
});

export function ReviewCard({ review }: { review: ReviewCardData }) {
  return (
    <article className="rounded-lg border border-border bg-card p-5 shadow-sm">
      <header className="flex flex-col gap-2 border-b border-border pb-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <h3 className="text-base font-semibold leading-snug text-foreground">
            {review.title}
          </h3>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Anonymous student · {DATE_FMT.format(new Date(review.created_at))}
          </p>
        </div>
        <Rating value={review.rating} size="md" />
      </header>
      <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-foreground">
        {review.body}
      </p>
      <dl className="mt-4 grid grid-cols-2 gap-3 border-t border-border pt-3 text-xs sm:grid-cols-3">
        <div>
          <dt className="text-[11px] uppercase tracking-wide text-muted-foreground">Difficulty</dt>
          <dd className="mt-0.5 font-medium tabular-nums text-foreground">
            {review.difficulty.toFixed(1)} <span className="text-muted-foreground">/ 5</span>
          </dd>
        </div>
        <div>
          <dt className="text-[11px] uppercase tracking-wide text-muted-foreground">Workload</dt>
          <dd className="mt-0.5 font-medium tabular-nums text-foreground">
            {review.workload_hours}
            <span className="text-muted-foreground"> h/wk</span>
          </dd>
        </div>
        <div>
          <dt className="text-[11px] uppercase tracking-wide text-muted-foreground">Rating</dt>
          <dd className="mt-0.5 font-medium tabular-nums text-foreground">
            {review.rating.toFixed(1)} <span className="text-muted-foreground">/ 5</span>
          </dd>
        </div>
      </dl>
    </article>
  );
}
