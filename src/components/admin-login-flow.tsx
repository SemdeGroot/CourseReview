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
import {
  LeidenEmailInput,
  LEIDEN_EMAIL_DOMAIN,
  normalizeLeidenEmailPrefix,
  validateLeidenEmailPrefix,
} from "@/components/leiden-email-input";
import { requestOtpAction } from "@/server-actions/auth";
import { verifyAdminOtpAction } from "@/server-actions/admin";

type Stage = "email" | "code";

export function AdminLoginFlow() {
  const router = useRouter();
  const [stage, setStage] = useState<Stage>("email");
  const [emailPrefix, setEmailPrefix] = useState("");
  const [code, setCode] = useState("");
  const [pending, startTransition] = useTransition();

  function onSendCode(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const validationError = validateLeidenEmailPrefix(emailPrefix);
    if (validationError) {
      toast.error(validationError);
      return;
    }
    const prefix = normalizeLeidenEmailPrefix(emailPrefix);
    const fullEmail = `${prefix}${LEIDEN_EMAIL_DOMAIN}`;
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
    const validationError = validateLeidenEmailPrefix(emailPrefix);
    if (validationError) {
      toast.error(validationError);
      return;
    }
    const fullEmail = `${normalizeLeidenEmailPrefix(emailPrefix)}${LEIDEN_EMAIL_DOMAIN}`;
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
          {stage === "email" ? (
            "Verify your Leiden email to continue. Codes are valid for 60 minutes."
          ) : (
            <>
              We emailed a 6-digit code to{" "}
              <span className="break-all font-medium text-foreground">
                {normalizeLeidenEmailPrefix(emailPrefix)}
                {LEIDEN_EMAIL_DOMAIN}
              </span>
              . It is valid for 60 minutes.
            </>
          )}
        </CardDescription>
      </CardHeader>

      {stage === "email" ? (
        <form onSubmit={onSendCode}>
          <CardContent className="space-y-2">
            <Label htmlFor="email">Leiden email</Label>
            <LeidenEmailInput
              id="email"
              value={emailPrefix}
              onChange={setEmailPrefix}
              disabled={pending}
            />
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
