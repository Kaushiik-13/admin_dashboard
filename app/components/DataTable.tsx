import { ReactNode } from "react";

export interface Column {
  key: string;
  header: string;
  render?: (value: unknown, row: Record<string, unknown>) => ReactNode;
  width?: string;
}

interface DataTableProps {
  columns: Column[];
  data: Record<string, unknown>[];
  title?: string;
  headerRight?: ReactNode;
}

export default function DataTable({
  columns,
  data,
  title,
  headerRight,
}: DataTableProps) {
  return (
    <div
      style={{
        background: "#ffffff",
        borderRadius: "8px",
        border: "1px solid #e5e7eb",
        overflow: "hidden",
      }}
    >
      {(title || headerRight) && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "16px 24px",
            borderBottom: "1px solid #e5e7eb",
          }}
        >
          {title && (
            <h3
              style={{
                fontSize: "15px",
                fontWeight: 600,
                color: "#1a1a1a",
                margin: 0,
              }}
            >
              {title}
            </h3>
          )}
          {headerRight && <div style={{ display: "flex", gap: "8px" }}>{headerRight}</div>}
        </div>
      )}

      <div style={{ overflowX: "auto" }}>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            fontSize: "13px",
          }}
        >
          <thead>
            <tr style={{ borderBottom: "1px solid #e5e7eb" }}>
              {columns.map((col) => (
                <th
                  key={col.key}
                  style={{
                    textAlign: "left",
                    padding: "12px 24px",
                    fontSize: "12px",
                    fontWeight: 600,
                    color: "#9ca3af",
                    whiteSpace: "nowrap",
                    width: col.width,
                  }}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, idx) => (
              <tr
                key={idx}
                style={{
                  borderBottom:
                    idx < data.length - 1 ? "1px solid #f3f4f6" : "none",
                }}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    style={{
                      padding: "14px 24px",
                      color: "#374151",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {col.render
                      ? col.render(row[col.key], row)
                      : (row[col.key] as ReactNode)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
