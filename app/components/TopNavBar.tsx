"use client";

import Link from "next/link";

export default function TopNavBar() {
  return (
    <nav
      style={{
        background: "#ffffff",
        borderBottom: "1px solid #e5e7eb",
        color: "#ffffff",
        display: "flex",
        alignItems: "center",
        height: "40px",
        padding: "0 24px",
        fontSize: "13px",
        fontWeight: 500,
        gap: "0",
        position: "sticky",
        top: 0,
        zIndex: 50,
      }}
    >
      <Link
        href="/admin/dashboard"
        style={{
          color: "#2d6a4f",
          fontWeight: 700,
          fontSize: "14px",
          textDecoration: "none",
          marginRight: "24px",
        }}
      >
        LocalHire
      </Link>


    </nav>
  );
}

function NavTab({
  label,
  href,
  badge,
  badgeColor,
  active,
}: {
  label: string;
  href: string;
  badge?: string;
  badgeColor?: string;
  active?: boolean;
}) {
  return (
    <Link
      href={href}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "6px",
        padding: "8px 16px",
        color: active ? "#ffffff" : "#9ca3af",
        textDecoration: "none",
        background: active ? "#333333" : "transparent",
        borderRadius: "4px",
        fontSize: "13px",
        transition: "all 0.15s ease",
      }}
    >
      {label}
      {badge && (
        <span
          style={{
            background: badgeColor,
            color: "#ffffff",
            fontSize: "10px",
            padding: "1px 8px",
            borderRadius: "4px",
            fontWeight: 600,
          }}
        >
          {badge}
        </span>
      )}
    </Link>
  );
}
