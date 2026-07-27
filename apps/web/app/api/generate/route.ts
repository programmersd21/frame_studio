import { NextRequest, NextResponse } from "next/server";
import { getApiKey } from "@/lib/apiKey";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import { planFromPrompt, generateCode, fixCode, type Brief, type CodeFileMap } from "pipeline";
import { compileCode } from "@/lib/compile";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function resolveSkeletonDir() {
  const candidates = [
    path.resolve(process.cwd(), "packages/remotion-skeleton"),
    path.resolve(process.cwd(), "../packages/remotion-skeleton"),
    path.resolve(process.cwd(), "../../packages/remotion-skeleton"),
    path.resolve(process.cwd(), "../../../packages/remotion-skeleton"),
    path.resolve(__dirname, "../../../../../packages/remotion-skeleton"),
  ];

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }

  throw new Error(
    `Could not locate packages/remotion-skeleton. Checked: ${candidates.join(", ")}`,
  );
}

export const dynamic = "force-dynamic";
export const maxDuration = 300;

export async function POST(req: NextRequest) {
  try {
    const skeletonDir = resolveSkeletonDir();
    const body = await req.json();
    const prompt = body.prompt?.trim();
    const model = body.model?.trim() || "gemini-3.6-flash";
    const clientApiKey = body.apiKey?.trim();
    const durationSeconds = body.durationSeconds ? Number(body.durationSeconds) : undefined;
    const pdfContent = body.pdfContent?.trim() || undefined;
    const width = body.width ? Number(body.width) : 1920;
    const height = body.height ? Number(body.height) : 1080;

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required." }, { status: 400 });
    }

    const apiKey =
      clientApiKey || (await getApiKey()) || process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "API key required. Please provide your Gemini API key." },
        { status: 401 },
      );
    }

    console.log(`\n[Generate] Starting generation for prompt: "${prompt}"`);
    process.env.GEMINI_API_KEY = apiKey;

    // STAGE 1: PLAN
    console.log(`[Generate] STAGE: Planning...`);
    const planResult = await planFromPrompt(prompt, { model, durationSeconds, pdfContent });

    if (!planResult.valid) {
      return NextResponse.json(
        { error: planResult.reason },
        { status: 400 },
      );
    }

    const brief: Brief = planResult.brief;
    console.log(`[Generate] Planning complete. Scenes: ${brief.scenes.length}`);

    // STAGE 2: CODEGEN
    console.log(`[Generate] STAGE: Generating Code...`);
    let currentCode: CodeFileMap = await generateCode(brief, [], model, pdfContent, width, height);
    console.log(`[Generate] Codegen complete. Files: ${Object.keys(currentCode).join(", ")}`);

    // STAGE 3 & 4: COMPILE & FIX LOOP
    console.log(`[Generate] STAGE: Compiling...`);
    let attempt = 0;
    let compiledFiles: Record<string, string> | undefined;
    const maxRetries = 3;

    while (attempt <= maxRetries) {
      const compileResult = await compileCode(currentCode, skeletonDir);

      if (compileResult.ok && compileResult.compiledFiles) {
        console.log(`[Generate] Compilation succeeded on attempt ${attempt}`);
        compiledFiles = compileResult.compiledFiles;
        break;
      }

      attempt++;
      console.warn(`[Generate] Compilation failed (attempt ${attempt}/${maxRetries})`);

      if (attempt > maxRetries) {
        return NextResponse.json(
          {
            error: `Compilation failed after ${maxRetries} attempts: ${compileResult.error}`,
          },
          { status: 500 },
        );
      }

      console.log(`[Generate] Calling Fix AI for attempt ${attempt}...`);
      currentCode = await fixCode(currentCode, compileResult.error!, model);
    }

    if (!compiledFiles) {
      throw new Error("Missing compiled files");
    }

    const fps = 30;
    const durationInFrames = Math.ceil(brief.durationSeconds * fps);

    console.log(`[Generate] Returning compiled code (${Object.keys(compiledFiles).length} files)`);

    return NextResponse.json({
      compiledFiles,
      sourceFiles: currentCode,
      metadata: {
        durationInFrames,
        fps,
        width,
        height,
        durationSeconds: brief.durationSeconds,
      },
    });
  } catch (err: any) {
    console.error("[Generate] Error:", err);
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 },
    );
  }
}
