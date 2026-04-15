"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const menuSections = [
  {
    title: "Overview",
    items: [
      { label: "Dashboard", href: "/admin/dashboard", icon: "📊" },
      { label: "Analytics", href: "/admin/analytics", icon: "📈" },
    ],
  },
  {
    title: "Users",
    items: [
      { label: "Workers", href: "/admin/workers", icon: "👷" },
      { label: "Employers", href: "/admin/employers", icon: "🏢" },
      { label: "Service Providers", href: "/admin/service-providers", icon: "🔧" },
      { label: "Verification Queue", href: "/admin/verification-queue", icon: "✅" },
    ],
  },
  {
    title: "Content",
    items: [
      { label: "Job Posts", href: "/admin/job-posts", icon: "📋" },
      { label: "Reports & Disputes", href: "/admin/reports", icon: "⚠️" },
    ],
  },
  {
    title: "System",
    items: [
      // { label: "Revenue & Plans", href: "/admin/revenue", icon: "💰" },
      { label: "Configuration", href: "/admin/configuration", icon: "⚙️" },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside
      style={{
        width: "220px",
        minWidth: "220px",
        background: "#151412",
        borderRight: "1px solid #e5e7eb",
        padding: "16px 0",
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        overflowY: "auto",
      }}
    >
      {/* Menu sections */}
      {menuSections.map((section) => (
        <div key={section.title} style={{ marginBottom: "8px" }}>
          <div
            style={{
              fontSize: "10px",
              fontWeight: 600,
              color: "#CCCCCC",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
              padding: "8px 16px 4px",
            }}
          >
            {section.title}
          </div>
          {section.items.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "8px 16px",
                  margin: "1px 8px",
                  borderRadius: "6px",
                  fontSize: "13px",
                  fontWeight: isActive ? 600 : 400,
                  color: isActive ? "#ffffff" : "#CCCCCC",
                  background: isActive ? "#2d6a4f" : "transparent",
                  textDecoration: "none",
                  transition: "all 0.15s ease",
                }}
              >
                <span style={{ fontSize: "14px", opacity: isActive ? 1 : 0.6 }}>
                  {item.icon}
                </span>
                {item.label}
              </Link>
            );
          })}
        </div>
      ))}
    </aside>
  );
}
