"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Mail } from "lucide-react";
import { toast } from "sonner";

import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const ALLOWED_DOMAIN = "@umail.leidenuniv.nl";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") ?? "/";

  const [stage, setStage] = useState<"email" | "code">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [pending, startTransition] = useTransition();

  const supabase = createSupabaseBrowserClient();

  async function sendOtp(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const normalised = email.trim().toLowerCase();
    if (!normalised.endsWith(ALLOWED_DOMAIN)) {
      toast.error(`Only ${ALLOWED_DOMAIN} addresses are allowed.`);
      return;
    }
    setEmail(normalised);

    startTransition(async () => {
      const { error } = await supabase.auth.signInWithOtp({
        email: normalised,
        options: { shouldCreateUser: true, emailRedirectTo: undefined },
      });
      if (error) {
        toast.error(error.message);
        return;
      }
      toast.success("We sent a 6-digit code to your email.");
      setStage("code");
    });
  }

  async function verifyOtp(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const token = code.replace(/\s+/g, "");
    if (!/^\d{6}$/.test(token)) {
      toast.error("Enter the 6-digit code from your email.");
      return;
    }

    startTransition(async () => {
      const { error } = await supabase.auth.verifyOtp({
        email,
        token,
        type: "email",
      });
      if (error) {
        toast.error(error.message);
        return;
      }
      toast.success("Signed in.");
      router.push(redirect);
      router.refresh();
    });
  }

  if (stage === "email") {
    return (
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Sign in</CardTitle>
          <CardDescription>
            Enter your Leiden University email and we will send a 6-digit code.
          </CardDescription>
        </CardHeader>
        <form onSubmit={sendOtp}>
          <CardContent className="space-y-3">
            <Label htmlFor="email">Leiden email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              required
              placeholder={`yourname${ALLOWED_DOMAIN}`}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={pending}
            />
            <p className="text-xs text-muted-foreground">
              Restricted to <span className="font-mono">{ALLOWED_DOMAIN}</span>.
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

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="text-2xl">Enter code</CardTitle>
        <CardDescription>
          We emailed a 6-digit code to{" "}
          <span className="font-medium text-foreground">{email}</span>.
        </CardDescription>
      </CardHeader>
      <form onSubmit={verifyOtp}>
        <CardContent className="space-y-3">
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
            {pending ? "Verifying..." : "Verify and sign in"}
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
