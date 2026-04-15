import Link from "next/link";
import { ArrowRight, Search, Star } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <>
      <section className="border-b border-border bg-gradient-to-b from-leiden-surface to-background">
        <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
          <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1 text-xs font-medium text-muted-foreground">
            <Star size={14} className="text-accent" /> Anonymous reviews by Leiden CS students
          </p>
          <h1 className="max-w-3xl text-4xl font-semibold leading-[1.1] tracking-tight text-foreground sm:text-5xl">
            Pick the right courses. Skip the regrets.
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted-foreground">
            Honest ratings on difficulty, workload, and teaching quality for every course in the
            MSc Computer Science program at Universiteit Leiden — written by students who actually
            took them.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Button
              asChild
              size="lg"
              className="bg-accent text-accent-foreground hover:bg-accent/90"
            >
              <Link href="/login?redirect=/">
                Add your review <ArrowRight size={16} />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="#courses">
                <Search size={16} /> Browse courses
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <section id="courses" className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6">
        <div className="rounded-lg border border-border bg-card p-8 text-center">
          <h2 className="text-xl font-semibold text-foreground">Courses are loading soon</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
            The database is being seeded with courses from all seven MSc Computer Science
            specializations. Come back shortly.
          </p>
        </div>
      </section>
    </>
  );
}
