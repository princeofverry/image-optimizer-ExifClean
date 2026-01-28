import { NextResponse } from "next/server";
import sharp from "sharp";
import exifReader from "exif-reader";

export const runtime = "nodejs";

type GpsResult =
  | { hasGps: false }
  | {
      hasGps: true;
      hasLatLon: boolean;
      lat: any;
      lon: any;
      latRef: any;
      lonRef: any;
      altitude: any;
      timestamp: any;
    };

function pickGps(exif: any): GpsResult {
  const gps =
    exif?.gps ??
    exif?.GPS ??
    exif?.GPSInfo ??
    exif?.GPSIFD ??
    exif?.gpsInfo ??
    null;

  if (!gps) return { hasGps: false };

  const lat = gps.GPSLatitude ?? gps.latitude ?? gps.Latitude ?? null;
  const lon = gps.GPSLongitude ?? gps.longitude ?? gps.Longitude ?? null;

  const latRef =
    gps.GPSLatitudeRef ?? gps.latitudeRef ?? gps.LatitudeRef ?? null;
  const lonRef =
    gps.GPSLongitudeRef ?? gps.longitudeRef ?? gps.LongitudeRef ?? null;

  const hasLatLon = lat != null && lon != null;

  return {
    hasGps: true,
    hasLatLon,
    lat,
    lon,
    latRef,
    lonRef,
    altitude: gps.GPSAltitude ?? gps.altitude ?? null,
    timestamp: gps.GPSTimeStamp ?? gps.timestamp ?? null,
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

    // 1) Sharp metadata
    const m = await sharp(input).metadata();

    // 2) Parse EXIF (optional)
    let exifObj: any = null;
    let exifKeys: string[] = [];
    let gpsRaw: any = null;

    if (m.exif) {
      try {
        exifObj = exifReader(m.exif);
        if (exifObj && typeof exifObj === "object") {
          exifKeys = Object.keys(exifObj);
          gpsRaw =
            exifObj.gps ??
            exifObj.GPS ??
            exifObj.GPSInfo ??
            exifObj.GPSIFD ??
            exifObj.gpsInfo ??
            null;
        }
      } catch (e) {
        // parsing EXIF gagal -> tetap lanjut, tapi catat buat debug
        exifObj = null;
        exifKeys = [];
        gpsRaw = null;
      }
    }

    const gpsInfo: GpsResult = exifObj ? pickGps(exifObj) : { hasGps: false };

    // 3) Safe response
    const safe = {
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

      hasExif: !!m.exif,
      hasIcc: !!m.icc,
      hasIptc: !!m.iptc,
      hasXmp: !!m.xmp || !!m.xmpAsString,
      comments: m.comments ? m.comments.length : 0,

      gps: gpsInfo,

      debug: {
        exifKeys,
        gpsRawExists: gpsRaw != null,
        gpsRaw,
      },
    };

    return NextResponse.json(safe);
  } catch (err: unknown) {
    return NextResponse.json(
      {
        error: "Failed to read metadata",
        detail: err instanceof Error ? err.message : String(err),
      },
      { status: 500 }
    );
  }
}
