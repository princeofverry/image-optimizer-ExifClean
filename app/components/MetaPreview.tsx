"use client";

export default function MetaPreview({ meta }: { meta: any }) {
  if (!meta) return null;

  return (
    <div style={{ marginTop: 16 }}>
      <p>
        <b>GPS:</b>{" "}
        {meta?.gps?.hasGps
          ? `${meta.gps.latitude ?? "-"}, ${meta.gps.longitude ?? "-"}`
          : "No embedded GPS"}
      </p>

      <div
        style={{ maxHeight: 350, overflow: "auto", border: "1px solid #ddd" }}
      >
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th
                style={{
                  textAlign: "left",
                  padding: 8,
                  borderBottom: "1px solid #eee",
                }}
              >
                Name
              </th>
              <th
                style={{
                  textAlign: "left",
                  padding: 8,
                  borderBottom: "1px solid #eee",
                }}
              >
                Value
              </th>
            </tr>
          </thead>
          <tbody>
            {(meta.table ?? []).map((r: any) => (
              <tr key={r.name}>
                <td
                  style={{
                    padding: 8,
                    borderBottom: "1px solid #f3f3f3",
                    width: "35%",
                  }}
                >
                  {r.name}
                </td>
                <td style={{ padding: 8, borderBottom: "1px solid #f3f3f3" }}>
                  {r.value}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
