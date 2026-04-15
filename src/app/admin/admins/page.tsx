import { Info } from "lucide-react";

import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata = { title: "Admin · Admins" };

export default async function AdminAdminsPage() {
  const supabase = await createSupabaseServerClient();
  const { data: admins } = await supabase
    .from("admins")
    .select("*")
    .order("created_at", { ascending: true });

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Admins
        </h1>
        <p className="text-sm text-muted-foreground">
          Whitelisted email addresses that can access <span className="font-mono">/admin</span>.
        </p>
      </div>

      <div className="rounded-lg border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-4 py-3 text-left font-medium">Email</th>
              <th className="px-3 py-3 text-left font-medium">Added</th>
            </tr>
          </thead>
          <tbody>
            {(admins ?? []).map((a) => (
              <tr key={a.email} className="border-b border-border last:border-0">
                <td className="px-4 py-3 font-mono">{a.email}</td>
                <td className="px-3 py-3 text-muted-foreground">
                  {new Date(a.created_at).toLocaleDateString("en-GB", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-start gap-3 rounded-md border border-border bg-secondary/50 p-4 text-sm text-muted-foreground">
        <Info size={16} className="mt-0.5 shrink-0" />
        <p>
          Admins are managed via <span className="font-mono">supabase/seed.sql</span> and SQL migrations to keep the privileged set small and auditable.
          Add a new admin by inserting a row into <span className="font-mono">public.admins</span> and running <span className="font-mono">npm run db:reset</span>.
        </p>
      </div>
    </div>
  );
}
