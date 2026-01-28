"use client";

import UploadBox from "./UploadBox";
import ActionButton from "./ActionButton";
import MetaPreview from "./MetaPreview";

import React, { useState } from "react";

type InspectResponse = any;

const ExifCleaner = () => {
  const [file, setFile] = useState<File | null>(null);
  const [meta, setMeta] = useState<InspectResponse | null>(null);
  const [msg, setMsg] = useState("");
  const [loadingMeta, setLoadingMeta] = useState(false);
  const [loadingStrip, setLoadingStrip] = useState(false);

  async function checkMetadata() {
    if (!file) return;
    setLoadingMeta(true);
    setMsg("");
    setMeta(null);

    try {
      const fd = new FormData();
      fd.append("file", file);

      // ✅ pakai /api/inspect (yang detail)
      const res = await fetch("/api/inspect", { method: "POST", body: fd });

      if (!res.ok) {
        const j = await res.json().catch(() => null);
        throw new Error(j?.error || "Failed to read metadata");
      }

      const json = await res.json();
      setMeta(json);
      setMsg("Metadata loaded.");
    } catch (e: any) {
      setMsg(`Failed to read metadata: ${e.message}`);
    } finally {
      setLoadingMeta(false);
    }
  }

  async function stripAndDownload() {
    if (!file) return;
    setLoadingStrip(true);
    setMsg("");

    try {
      const fd = new FormData();
      fd.append("file", file);

      // ✅ ini endpoint yang mengembalikan file (binary)
      const res = await fetch("/api/strip-exif", { method: "POST", body: fd });

      if (!res.ok) {
        const j = await res.json().catch(() => null);
        throw new Error(j?.error || "Failed to process image");
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = "exifclean.jpg";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);

      setMsg("Done! download started.");
    } catch (e: any) {
      setMsg(`Failed to process image: ${e.message}`);
    } finally {
      setLoadingStrip(false);
    }
  }

  return (
    <main style={{ padding: 24, fontFamily: "system-ui", maxWidth: 900 }}>
      <h1>ExifClean (Sharp Playground)</h1>
      <p>Upload → preview metadata → strip EXIF → download.</p>

      <UploadBox
        onPick={(f) => {
          setFile(f);
          setMeta(null);
          setMsg("");
        }}
      />

      <ActionButton
        disabled={!file}
        loadingMeta={loadingMeta}
        loadingStrip={loadingStrip}
        onCheck={checkMetadata}
        onStrip={stripAndDownload}
      />

      {msg && <p style={{ marginTop: 12 }}>{msg}</p>}

      {/* MetaPreview harus nerima format dari /api/inspect */}
      <MetaPreview meta={meta} />
    </main>
  );
};

export default ExifCleaner;
