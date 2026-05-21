"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Mail, ShieldCheck } from "lucide-react";
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
import { requestOtpAction } from "@/server-actions/auth";
import { verifyAdminOtpAction } from "@/server-actions/admin";

const ALLOWED_DOMAIN = "@umail.leidenuniv.nl";
type Stage = "email" | "code";

export function AdminLoginFlow() {
  const router = useRouter();
  const [stage, setStage] = useState<Stage>("email");
  const [emailPrefix, setEmailPrefix] = useState("");
  const [code, setCode] = useState("");
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
      toast.success("We sent a 6-digit code to your email.");
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
      const res = await verifyAdminOtpAction(fullEmail, token);
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      router.push(res.redirectTo);
      router.refresh();
    });
  }

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-2xl">
          <ShieldCheck size={20} className="text-primary" />
          Admin access
        </CardTitle>
        <CardDescription>
          {stage === "email"
            ? "Verify your Leiden email to continue."
            : `We emailed a 6-digit code to ${emailPrefix.trim().toLowerCase()}${ALLOWED_DOMAIN}.`}
        </CardDescription>
      </CardHeader>

      {stage === "email" ? (
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
          </CardContent>
          <CardFooter className="mt-5">
            <Button type="submit" className="w-full" disabled={pending}>
              <Mail size={16} /> {pending ? "Sending..." : "Send code"}
            </Button>
          </CardFooter>
        </form>
      ) : (
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
              {pending ? "Verifying..." : "Verify"}
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
      )}
    </Card>
  );
}
