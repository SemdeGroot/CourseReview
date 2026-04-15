import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { adminSignOutAction } from "@/server-actions/admin";

export function AdminSignOut() {
  return (
    <form action={adminSignOutAction}>
      <Button type="submit" variant="ghost" size="sm" className="gap-2">
        <LogOut size={14} />
        Sign out
      </Button>
    </form>
  );
}
