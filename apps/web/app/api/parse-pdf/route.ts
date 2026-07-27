import { NextRequest, NextResponse } from "next/server";

const pdf = require("pdf-parse");

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided." }, { status: 400 });
    }

    if (file.type !== "application/pdf") {
      return NextResponse.json({ error: "Only PDF files are supported." }, { status: 400 });
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "PDF must be under 10MB." }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const data = await pdf(buffer);

    const text = data.text?.trim();
    if (!text) {
      return NextResponse.json({ error: "Could not extract text from PDF. The file may be image-based." }, { status: 400 });
    }

    return NextResponse.json({
      text,
      pages: data.numpages,
      title: data.info?.Title || null,
    });
  } catch (err: any) {
    console.error("[Parse PDF] Error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to parse PDF" },
      { status: 500 },
    );
  }
}
