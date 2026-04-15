"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

type ActionFn = () => Promise<{ ok: true } | { ok: false; error: string }>;

type Props = {
  title: string;
  description: string;
  action: ActionFn;
  successMessage: string;
  buttonLabel?: string;
  size?: "sm" | "default";
};

export function ConfirmDeleteButton({
  title,
  description,
  action,
  successMessage,
  buttonLabel = "Delete",
  size = "sm",
}: Props) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function handleConfirm() {
    startTransition(async () => {
      const res = await action();
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      toast.success(successMessage);
      setOpen(false);
      router.refresh();
    });
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="outline" size={size} className="text-destructive hover:bg-destructive/10">
          <Trash2 size={14} />
          <span className="sr-only sm:not-sr-only">{buttonLabel}</span>
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={pending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              handleConfirm();
            }}
            disabled={pending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {pending ? "Deleting..." : buttonLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
