import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return document.cookie
            .split("; ")
            .filter(Boolean)
            .map((c) => {
              const i = c.indexOf("=");
              return { name: c.slice(0, i), value: c.slice(i + 1) };
            });
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            let cookie = `${name}=${value}; path=/; SameSite=Lax`;
            if (options?.maxAge) cookie += `; max-age=${options.maxAge}`;
            if (options?.domain) cookie += `; domain=${options.domain}`;
            if (options?.secure) cookie += "; secure";
            document.cookie = cookie;
          });
        },
      },
    },
  );
}
