import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { nanoid } from "nanoid";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authErr } = await supabase.auth.getUser();

    if (authErr || !user) {
      const reason = authErr?.message || "Not authenticated";
      return NextResponse.json({ error: reason }, { status: 401 });
    }

    const formData = await req.formData();
    const video = formData.get("video") as File | null;
    const prompt = formData.get("prompt") as string | null;
    const model = formData.get("model") as string | null;

    if (!video) {
      return NextResponse.json({ error: "No video file provided" }, { status: 400 });
    }

    const ext = video.name.split(".").pop() || "mp4";
    const filename = `frame-studio-${nanoid(12)}.${ext}`;
    const storagePath = `${user.id}/${filename}`;

    const { error: uploadError } = await supabase.storage
      .from("videos")
      .upload(storagePath, video, {
        contentType: video.type || "video/mp4",
        upsert: false,
      });

    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    const { data: { publicUrl } } = supabase.storage
      .from("videos")
      .getPublicUrl(storagePath);

    const { error: dbError } = await supabase.from("videos").insert({
      user_id: user.id,
      prompt: prompt || "",
      model: model || "",
      filename,
      storage_path: storagePath,
      video_url: publicUrl,
    });

    if (dbError) {
      return NextResponse.json({ error: dbError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, url: publicUrl, filename });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
