import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/lib/database.types";

/**
 * All Supabase auth cookies are forced to `httpOnly` so session tokens are
 * never exposed to client-side JavaScript. Combined with `secure` in
 * production, this mitigates XSS session theft.
 */
function hardenCookieOptions(options: CookieOptions): CookieOptions {
  return {
    ...options,
    httpOnly: true,
    sameSite: options.sameSite ?? "lax",
    secure: process.env.NODE_ENV === "production",
  };
}

export async function createSupabaseServerClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(
          cookiesToSet: { name: string; value: string; options: CookieOptions }[],
        ) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, hardenCookieOptions(options)),
            );
          } catch {
            // Called from a Server Component without a writable cookie store.
            // Middleware handles session refresh, so ignoring is safe.
          }
        },
      },
    },
  );
}
