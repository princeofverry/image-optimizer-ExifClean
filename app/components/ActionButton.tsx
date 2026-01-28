"use client";

type Props = {
  disabled: boolean;
  loadingMeta: boolean;
  loadingStrip: boolean;
  onCheck: () => void;
  onStrip: () => void;
};

export default function ActionButtons({
  disabled,
  loadingMeta,
  loadingStrip,
  onCheck,
  onStrip,
}: Props) {
  return (
    <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
      <button
        onClick={onCheck}
        disabled={disabled || loadingMeta}
        className="bg-blue-400"
      >
        {loadingMeta ? "Checking..." : "Check Metadata"}
      </button>

      <button
        className="bg-green-400"
        onClick={onStrip}
        disabled={disabled || loadingStrip}
      >
        {loadingStrip ? "Processing..." : "Strip EXIF & Download"}
      </button>
    </div>
  );
}
