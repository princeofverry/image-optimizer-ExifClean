"use client";

type Props = {
  onPick: (file: File | null) => void;
};

export default function UploadBox({ onPick }: Props) {
  return (
    <div style={{ marginTop: 12 }}>
      <input
        type="file"
        accept="image/*"
        onChange={(e) => onPick(e.target.files?.[0] ?? null)}
      />
    </div>
  );
}
