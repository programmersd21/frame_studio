import { NextRequest, NextResponse } from "next/server";
import { setApiKey, getApiKey, clearApiKey } from "@/lib/apiKey";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const apiKey = body.apiKey?.trim();

    if (!apiKey) {
      return NextResponse.json({ error: "API key is required." }, { status: 400 });
    }

    // Basic validation: check if it looks like a Gemini API key
    if (!(apiKey.startsWith("AIza") || apiKey.startsWith("AQ")) || apiKey.length < 30) {
      return NextResponse.json(
        { error: "Invalid API key format. Gemini API keys start with 'AIza' or 'AQ'." },
        { status: 400 }
      );
    }

    await setApiKey(apiKey);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to save API key" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const apiKey = await getApiKey();
    return NextResponse.json({ hasApiKey: !!apiKey });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to check API key" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await clearApiKey();
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to clear API key" },
      { status: 500 }
    );
  }
}
