import { serve } from "std/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const FROM_EMAIL = Deno.env.get("FROM_EMAIL") || "onboarding@resend.dev";

const APP_URL = "https://frame-studio-eta.vercel.app";

const BASE_EMAIL = (title: string, gradient: string, bodyContent: string) => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
    * { font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif; }
  </style>
</head>
<body style="margin:0;padding:0;background:#f5f5f7;-webkit-font-smoothing:antialiased">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f7;padding:48px 24px" role="presentation">
    <tr><td align="center">
      <table width="464" cellpadding="0" cellspacing="0" style="max-width:100%" role="presentation">
        <tr><td style="padding-bottom:28px;text-align:center">
          <span style="font-size:18px;font-weight:700;letter-spacing:-0.4px;color:#1d1d1f">Frame Studio</span>
        </td></tr>
        <tr><td style="background:#ffffff;border-radius:24px;box-shadow:0 12px 40px rgba(0,0,0,0.05)">
          <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
            <tr><td height="4" style="height:4px;border-radius:24px 24px 0 0;background:${gradient};font-size:0;line-height:0">&nbsp;</td></tr>
          </table>
          <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 36px" role="presentation">
            ${bodyContent}
          </table>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

const btnCell = (url: string, label: string) => `
<tr><td style="text-align:center;padding-bottom:4px">
  <table cellpadding="0" cellspacing="0" style="margin:0 auto" role="presentation"><tr>
    <td style="border-radius:14px;background:#0071e3;box-shadow:0 4px 16px rgba(0,113,227,0.3)">
      <a href="${url}" style="display:inline-block;padding:14px 36px;border-radius:14px;background:#0071e3;color:#fff;font-size:15px;font-weight:600;text-decoration:none">${label}</a>
    </td>
  </tr></table>
</td></tr>`;

const fallbackCell = (url: string) => `
<tr><td style="padding-top:28px;border-top:1px solid #f0f0f0;text-align:center">
  <p style="margin:0 0 6px;font-size:12px;color:#a1a1a6">If the button doesn't work, copy and paste this link:</p>
  <p style="margin:0;font-size:11px;color:#86868b;word-break:break-all;line-height:1.5">${url}</p>
</td></tr>`;

const footerCell = `<tr><td style="padding-top:24px;text-align:center">
  <p style="margin:0;font-size:12px;color:#a1a1a6;line-height:1.5">This email was sent automatically. If you didn't request this, you can safely ignore it.</p>
</td></tr>`;

function getSubject(type: string): string {
  switch (type) {
    case "magiclink": return "Your magic link — Frame Studio";
    case "recovery": return "Reset your password — Frame Studio";
    default: return "Frame Studio";
  }
}

function getHtmlBody(type: string, redirectTo: string, tokenHash: string): string {
  const url = `${redirectTo}?token_hash=${tokenHash}&type=${type}`;

  if (type === "magiclink") {
    return BASE_EMAIL("Sign in to Frame Studio", "linear-gradient(90deg,#0071e3,#34e0a4)", `
      <tr><td style="text-align:center;padding-bottom:6px">
        <h1 style="margin:0;font-size:22px;font-weight:600;color:#1d1d1f">Sign in to Frame Studio</h1>
      </td></tr>
      <tr><td style="text-align:center;padding-bottom:28px">
        <p style="margin:0;font-size:15px;line-height:1.6;color:#86868b">Click the button below to sign in instantly. No password needed.</p>
      </td></tr>
      ${btnCell(url, "Sign In")}
      ${fallbackCell(url)}
      ${footerCell}
    `);
  }

  if (type === "recovery") {
    return BASE_EMAIL("Reset your password", "linear-gradient(90deg,#ff9f0a,#ff2d55)", `
      <tr><td style="text-align:center;padding-bottom:6px">
        <h1 style="margin:0;font-size:22px;font-weight:600;color:#1d1d1f">Reset your password</h1>
      </td></tr>
      <tr><td style="text-align:center;padding-bottom:28px">
        <p style="margin:0;font-size:15px;line-height:1.6;color:#86868b">Click the button below to create a new password for your account.</p>
      </td></tr>
      ${btnCell(url, "Reset Password")}
      ${fallbackCell(url)}
      ${footerCell}
    `);
  }

  return "";
}

serve(async (req: Request) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { "Content-Type": "application/json" } });
  }

  if (!RESEND_API_KEY) {
    console.error("RESEND_API_KEY not set");
    return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { "Content-Type": "application/json" } });
  }

  try {
    const body = await req.json();
    const { user, email_data } = body;

    if (!user?.email || !email_data?.email_action_type) {
      return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { "Content-Type": "application/json" } });
    }

    const { email_action_type, redirect_to, token_hash } = email_data;
    const callbackUrl = redirect_to || `${APP_URL}/auth/callback`;

    const subject = getSubject(email_action_type);
    const html = getHtmlBody(email_action_type, callbackUrl, token_hash);

    if (!html) {
      console.error(`Unknown email action type: ${email_action_type}`);
      return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { "Content-Type": "application/json" } });
    }

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from: FROM_EMAIL, to: user.email, subject, html }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("Resend error:", err);
    }

    return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (err) {
    console.error("send-email error:", err);
    return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { "Content-Type": "application/json" } });
  }
});
