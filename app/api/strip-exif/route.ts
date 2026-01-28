import { NextResponse } from "next/server";
import sharp from "sharp";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const file = form.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const input = Buffer.from(await file.arrayBuffer());

    // delete metadata
    const output = await sharp(input)
      .rotate()
      .jpeg({ quality: 90 }) // encode to jpg
      .toBuffer();

    return new NextResponse(output, {
      headers: {
        "Content-Type": "image/jpeg",
        "Content-Disposition": 'attachment; filename="exifclean.jpg"',
        "Cache-Control": "no-store",
      },
    });
  } catch (err: unknown) {
    return NextResponse.json(
      {
        error: "Failed to process image",
        detail: err instanceof Error ? err.message : String(err),
      },
      { status: 500 }
    );
  }
}
