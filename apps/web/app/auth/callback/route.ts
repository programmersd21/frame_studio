import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

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

  const storageKey =
    `sb-${new URL(supabaseUrl).hostname.split(".")[0]}-auth-token`;

  const cookieOptions = {
    path: "/",
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 365,
  };

  if (code) {
    const supabase = createClient(supabaseUrl, supabaseKey);
    const {
      data: { session },
      error,
    } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && session) {
      const response = NextResponse.redirect(`${origin}${next}`);
      response.cookies.set(
        storageKey,
        JSON.stringify(session),
        cookieOptions,
      );
      return response;
    }
    return NextResponse.redirect(
      `${origin}/auth/signin?error=auth_callback_error`,
    );
  }

  if (token_hash && type) {
    const supabase = createClient(supabaseUrl, supabaseKey);
    const {
      data: { session },
      error,
    } = await supabase.auth.verifyOtp({
      token_hash,
      type: type as any,
    });

    if (!error && session) {
      const redirectUrl =
        type === "recovery" ? "/auth/reset-password" : next;
      const response = NextResponse.redirect(`${origin}${redirectUrl}`);
      response.cookies.set(
        storageKey,
        JSON.stringify(session),
        cookieOptions,
      );
      return response;
    }
    return NextResponse.redirect(
      `${origin}/auth/signin?error=verification_failed`,
    );
  }

  return NextResponse.redirect(`${origin}/auth/signin`);
}
