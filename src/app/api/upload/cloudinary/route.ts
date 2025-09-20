import { NextResponse } from "next/server";
import { uploadImageFromBuffer } from "@/lib/cloudinary";

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const files = form.getAll("files");
    if (!files || files.length === 0)
      return NextResponse.json({ error: "No files" }, { status: 400 });
    const uploads = await Promise.all(
      files.map(async (f) => {
        if (!(f instanceof File)) return null;
        const arrayBuffer = await f.arrayBuffer();
        const { url, public_id } = await uploadImageFromBuffer(
          Buffer.from(arrayBuffer)
        );
        return { url, public_id, name: f.name };
      })
    );
    return NextResponse.json({ uploads: uploads.filter(Boolean) });
  } catch (e) {
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
