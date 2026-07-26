import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

function makeClient(supabaseUrl: string, supabaseKey: string) {
  const storageKey =
    `sb-${new URL(supabaseUrl).hostname.split(".")[0]}-auth-token`;

  const cookieStore = cookies();

  const storage = {
    getItem: async (key: string) => {
      const c = (await cookieStore).get(key);
      return c?.value ?? null;
    },
    setItem: async (key: string, value: string) => {
      try {
        (await cookieStore).set(key, value, {
          path: "/",
          httpOnly: true,
          sameSite: "lax",
          secure: process.env.NODE_ENV === "production",
          maxAge: 60 * 60 * 24 * 365,
        });
      } catch {}
    },
    removeItem: async (key: string) => {
      try {
        (await cookieStore).set(key, "", { path: "/", maxAge: 0 });
      } catch {}
    },
  };

  return createClient(supabaseUrl, supabaseKey, {
    global: {
      fetch: async (input, init) => {
        const headers = new Headers(init?.headers);
        if (!headers.has("apikey")) {
          headers.set("apikey", supabaseKey);
        }
        return fetch(input, { ...init, headers });
      },
    },
    auth: {
      storageKey,
      storage,
      autoRefreshToken: false,
      persistSession: true,
      detectSessionInUrl: false,
      skipAutoInitialize: true,
      flowType: "pkce",
    },
  });
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type");
  const next = searchParams.get("next") ?? "/profile";

  const supabaseUrl =
    process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const supabaseKey =
    process.env.SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    "";

  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.redirect(
      `${origin}/auth/signin?error=configuration_error`,
    );
  }

  if (code) {
    const supabase = makeClient(supabaseUrl, supabaseKey);
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
    return NextResponse.redirect(
      `${origin}/auth/signin?error=auth_callback_error`,
    );
  }

  if (token_hash && type) {
    const supabase = makeClient(supabaseUrl, supabaseKey);
    const { error } = await supabase.auth.verifyOtp({
      token_hash,
      type: type as any,
    });
    if (!error) {
      if (type === "recovery") {
        return NextResponse.redirect(`${origin}/auth/reset-password`);
      }
      return NextResponse.redirect(`${origin}${next}`);
    }
    return NextResponse.redirect(
      `${origin}/auth/signin?error=verification_failed`,
    );
  }

  return NextResponse.redirect(`${origin}/auth/signin`);
}
