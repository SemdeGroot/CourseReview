import Link from "next/link";
import { GraduationCap } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col bg-leiden-surface">
      <header className="flex items-center justify-center px-4 py-6">
        <Link
          href="/"
          className="flex items-center gap-2 font-semibold tracking-tight text-foreground"
        >
          <span
            className="flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground"
            aria-hidden
          >
            <GraduationCap size={18} />
          </span>
          CourseReview
        </Link>
      </header>
      <main className="flex flex-1 items-start justify-center px-4 pb-16">
        <div className="w-full max-w-md">{children}</div>
      </main>
    </div>
  );
}
