import { NextResponse } from "next/server";
import sharp from "sharp";
import * as ExifReader from "exifreader";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Row = { name: string; value: string };

function stringifyValue(v: any): string {
  if (v == null) return "";
  if (typeof v === "string") return v;
  if (typeof v === "number" || typeof v === "boolean") return String(v);
  if (Array.isArray(v)) return v.map(stringifyValue).join(", ");
  if (typeof v === "object") {
    // ExifReader tag object sometimes contains {description, value}
    if ("description" in v && typeof (v as any).description === "string") {
      return (v as any).description;
    }
    try {
      return JSON.stringify(v);
    } catch {
      return String(v);
    }
  }
  return String(v);
}

// Flatten ExifReader output into key-value table
function buildTable(tags: any): Row[] {
  const rows: Row[] = [];

  // tags can be grouped (expanded:true) or merged
  // We'll handle both.
  const isExpanded =
    tags &&
    typeof tags === "object" &&
    Object.values(tags).some(
      (v) => v && typeof v === "object" && !("description" in v)
    );

  if (isExpanded) {
    // groups: exif, iptc, xmp, file, jfif, gps, composite, ...
    for (const [groupName, groupVal] of Object.entries(tags)) {
      if (!groupVal || typeof groupVal !== "object") continue;

      // For "Thumbnail" (binary) skip huge
      if (groupName.toLowerCase() === "thumbnail") continue;

      for (const [tagName, tagVal] of Object.entries(groupVal as any)) {
        // skip huge binary thumbnails
        if (String(tagName).toLowerCase().includes("thumbnail")) continue;

        const name = `${groupName}.${tagName}`;
        const value =
          (tagVal as any)?.description ??
          stringifyValue((tagVal as any)?.value ?? tagVal);

        rows.push({ name, value });
      }
    }
  } else {
    // not expanded, tags are direct key -> tagObject
    for (const [tagName, tagVal] of Object.entries(tags || {})) {
      if (String(tagName).toLowerCase().includes("thumbnail")) continue;

      const value =
        (tagVal as any)?.description ??
        stringifyValue((tagVal as any)?.value ?? tagVal);

      rows.push({ name: String(tagName), value });
    }
  }

  rows.sort((a, b) => a.name.localeCompare(b.name));
  return rows;
}

// Try to extract GPS from ExifReader output (expanded or merged)
function extractGps(tags: any) {
  // Expanded mode provides computed gps group (docs: gps group only when expanded:true)
  const gpsGroup = tags?.gps ?? null;

  const lat =
    gpsGroup?.Latitude?.description ??
    gpsGroup?.Latitude?.value ??
    tags?.GPSLatitude?.description ??
    tags?.GPSLatitude?.value ??
    null;

  const lon =
    gpsGroup?.Longitude?.description ??
    gpsGroup?.Longitude?.value ??
    tags?.GPSLongitude?.description ??
    tags?.GPSLongitude?.value ??
    null;

  // If gps group exists, it's a good signal GPS is present
  const hasGps =
    !!gpsGroup ||
    !!tags?.GPSLatitude ||
    !!tags?.GPSLongitude ||
    !!tags?.GPSPosition;

  return {
    hasGps,
    latitude: lat,
    longitude: lon,
    // optional raw hints (can be useful)
    position:
      tags?.GPSPosition?.description ?? tags?.GPSPosition?.value ?? null,
  };
}

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const file = form.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const input = Buffer.from(await file.arrayBuffer());

    // Sharp header metadata (fast)
    const m = await sharp(input).metadata();
    const sharpMeta = {
      format: m.format,
      size: m.size,
      width: m.width,
      height: m.height,
      space: m.space,
      channels: m.channels,
      depth: m.depth,
      density: m.density,
      orientation: m.orientation,
      hasAlpha: m.hasAlpha,
      hasProfile: m.hasProfile,
      isProgressive: m.isProgressive,
      pages: m.pages,
      pageHeight: m.pageHeight,
      comments: m.comments ? m.comments.length : 0,

      hasExif: !!m.exif,
      hasIcc: !!m.icc,
      hasIptc: !!m.iptc,
      hasXmp: !!m.xmp || !!m.xmpAsString,
    };

    // ExifReader detailed tags
    // expanded:true -> groups (exif/iptc/xmp/file/jfif/gps/composite...)
    // includeUnknown:true -> biar makin lengkap
    const tags = ExifReader.load(input, {
      expanded: true,
      includeUnknown: true,
      // async: true -> butuh Compression Streams API (kadang bikin ribet), keep false for now
      // async: false,
    });

    const gps = extractGps(tags);
    const table = buildTable(tags);

    return NextResponse.json({
      file: { name: file.name, type: file.type, size: file.size },
      sharp: sharpMeta,
      gps,
      tags, // full structured tags
      table, // flattened view for UI table
    });
  } catch (err: unknown) {
    return NextResponse.json(
      {
        error: "Failed to inspect metadata",
        detail: err instanceof Error ? err.message : String(err),
      },
      { status: 500 }
    );
  }
}
