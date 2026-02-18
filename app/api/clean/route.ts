import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const cleanedBuffer = await sharp(buffer)
      .toBuffer();

    return new NextResponse(cleanedBuffer as any, {
      headers: {
        "Content-Type": file.type,
        "Content-Disposition": `attachment; filename="clean_${file.name}"`,
      },
    });
  } catch (error) {
    console.error("Error processing image:", error);
    return NextResponse.json({ error: "Processing failed" }, { status: 500 });
  }
}