import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authErr } = await supabase.auth.getUser();

    if (authErr || !user) {
      return NextResponse.json({ error: authErr?.message || "Not authenticated" }, { status: 401 });
    }

    const { id } = await req.json();

    const { data: video, error: fetchError } = await supabase
      .from("videos")
      .select("storage_path")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (fetchError || !video) {
      return NextResponse.json({ error: "Video not found" }, { status: 404 });
    }

    await supabase.storage.from("videos").remove([video.storage_path]);

    const { error: deleteError } = await supabase
      .from("videos")
      .delete()
      .eq("id", id);

    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
