"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Mail } from "lucide-react";
import { toast } from "sonner";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LevelInput } from "@/components/level-input";
import { RatingInput } from "@/components/rating-input";
import { requestOtpAction, verifyOtpAction } from "@/server-actions/auth";
import { submitReviewAction } from "@/server-actions/reviews";

const ALLOWED_DOMAIN = "@umail.leidenuniv.nl";

type Stage = "email" | "code" | "form";

type Props = {
  course: { id: string; code: string; title: string };
  initialEmail: string | null;
};

export function ReviewFlow({ course, initialEmail }: Props) {
  const router = useRouter();
  const [stage, setStage] = useState<Stage>(initialEmail ? "form" : "email");
  const [emailPrefix, setEmailPrefix] = useState(initialEmail?.split("@")[0] ?? "");
  const [code, setCode] = useState("");

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [rating, setRating] = useState(0);
  const [difficulty, setDifficulty] = useState(0);
  const [workload, setWorkload] = useState<number | "">("");

  const [pending, startTransition] = useTransition();

  function onSendCode(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const prefix = emailPrefix.trim().toLowerCase();
    if (!prefix) {
      toast.error("Please enter your name part of the email.");
      return;
    }
    const fullEmail = `${prefix}${ALLOWED_DOMAIN}`;
    startTransition(async () => {
      const res = await requestOtpAction(fullEmail);
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      toast.success("We sent a 6-digit code to your email. It is valid for 60 minutes.");
      setStage("code");
    });
  }

  function onVerifyCode(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const token = code.replace(/\s+/g, "");
    if (!/^\d{6}$/.test(token)) {
      toast.error("Enter the 6-digit code from your email.");
      return;
    }
    const fullEmail = `${emailPrefix.trim().toLowerCase()}${ALLOWED_DOMAIN}`;
    startTransition(async () => {
      const res = await verifyOtpAction(fullEmail, token);
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      toast.success("Verified.");
      setStage("form");
    });
  }

  function onSubmitReview(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!rating || !difficulty || !workload) {
      toast.error("Please fill in rating, difficulty, and workload.");
      return;
    }
    startTransition(async () => {
      const res = await submitReviewAction({
        courseId: course.id,
        title: title.trim(),
        body: body.trim(),
        rating,
        difficulty,
        workload_hours: Number(workload),
      });
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      toast.success("Review published. Thanks!");
      router.push(res.redirectTo);
      router.refresh();
    });
  }

  if (stage === "email") {
    return (
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Verify your Leiden email</CardTitle>
          <CardDescription>
            We send a 6-digit code to confirm you are a Leiden student. Your review is anonymous.
            Your email is never shown on the site. The code is valid for 60 minutes.
          </CardDescription>
        </CardHeader>
        <form onSubmit={onSendCode}>
          <CardContent className="space-y-2">
            <Label htmlFor="email">Leiden email</Label>
            <div className="flex items-center overflow-hidden rounded-md border border-input bg-background focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/50 shadow-xs transition-shadow">
              <input
                id="email"
                type="text"
                autoComplete="username"
                required
                placeholder="e.g. s1234567"
                value={emailPrefix}
                onChange={(e) => setEmailPrefix(e.target.value)}
                disabled={pending}
                className="flex-1 bg-transparent px-3 py-2 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
              />
              <span className="pointer-events-none select-none border-l border-input bg-muted px-3 py-2 text-sm text-muted-foreground font-mono">
                {ALLOWED_DOMAIN}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Enter your student number or username.
            </p>
          </CardContent>
          <CardFooter className="mt-5">
            <Button type="submit" className="w-full" disabled={pending}>
              <Mail size={16} /> {pending ? "Sending..." : "Send code"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    );
  }

  if (stage === "code") {
    const fullEmail = `${emailPrefix.trim().toLowerCase()}${ALLOWED_DOMAIN}`;
    return (
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Enter code</CardTitle>
          <CardDescription>
            We emailed a 6-digit code to{" "}
            <span className="font-medium text-foreground">{fullEmail}</span>. It is valid for 60
            minutes.
          </CardDescription>
        </CardHeader>
        <form onSubmit={onVerifyCode}>
          <CardContent className="space-y-2">
            <Label htmlFor="code">Verification code</Label>
            <Input
              id="code"
              inputMode="numeric"
              autoComplete="one-time-code"
              pattern="[0-9]*"
              maxLength={6}
              required
              placeholder="123456"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              disabled={pending}
              className="tracking-[0.4em] text-center text-lg font-mono"
            />
          </CardContent>
          <CardFooter className="mt-5 flex-col gap-2">
            <Button type="submit" className="w-full" disabled={pending}>
              {pending ? "Verifying..." : "Verify and continue"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="w-full"
              onClick={() => {
                setStage("email");
                setCode("");
              }}
              disabled={pending}
            >
              <ArrowLeft size={14} /> Use a different email
            </Button>
          </CardFooter>
        </form>
      </Card>
    );
  }

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="text-2xl">Write your review</CardTitle>
            <CardDescription>
              Reviewing <span className="font-medium text-foreground">{course.title}</span> ·{" "}
              <span className="font-mono text-xs">{course.code}</span>
            </CardDescription>
          </div>
          <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-border bg-secondary px-2 py-1 text-xs font-medium text-muted-foreground">
            <CheckCircle2 size={12} className="text-accent" /> Verified
          </span>
        </div>
      </CardHeader>
      <form onSubmit={onSubmitReview}>
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              required
              minLength={3}
              maxLength={120}
              placeholder="e.g. Great if you like clean math, lighter on coding than expected"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={pending}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="body">Your experience</Label>
            <textarea
              id="body"
              required
              minLength={10}
              maxLength={4000}
              rows={6}
              placeholder="What were the lectures like? How were the assignments? What would you tell a future student?"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              disabled={pending}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
            />
            <p className="text-xs text-muted-foreground">
              {body.length} / 4000
            </p>
          </div>

          <div className="space-y-2">
            <Label>Overall rating</Label>
            <RatingInput value={rating} onChange={setRating} />
          </div>

          <div className="space-y-2">
            <Label>Difficulty</Label>
            <LevelInput
              value={difficulty}
              onChange={setDifficulty}
              labels={["Very easy", "Easy", "Moderate", "Hard", "Very hard"]}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="workload">Workload (hours per week)</Label>
            <Input
              id="workload"
              type="number"
              min={1}
              max={80}
              required
              placeholder="10"
              value={workload}
              onChange={(e) => {
                const v = e.target.value;
                setWorkload(v === "" ? "" : Number(v));
              }}
              disabled={pending}
              className="max-w-[160px]"
            />
          </div>
        </CardContent>
        <CardFooter className="mt-4 flex-col gap-2">
          <Button
            type="submit"
            className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
            disabled={pending}
          >
            {pending ? "Publishing..." : "Publish review"}
          </Button>
          <Button asChild type="button" variant="ghost" size="sm" className="w-full">
            <Link href={`/courses/${course.code}`}>Cancel</Link>
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
