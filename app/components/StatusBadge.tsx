type BadgeVariant =
  | "worker"
  | "employer"
  | "active"
  | "pending"
  | "verified"
  | "review"
  | "suspended"
  | "pro"
  | "free"
  | "blacklisted";

const variantStyles: Record<
  BadgeVariant,
  { bg: string; color: string }
> = {
  worker: { bg: "#dcfce7", color: "#166534" },
  employer: { bg: "#fff7ed", color: "#9a3412" },
  active: { bg: "#dcfce7", color: "#166534" },
  pending: { bg: "#fef3c7", color: "#92400e" },
  verified: { bg: "#dbeafe", color: "#1e40af" },
  review: { bg: "#fef3c7", color: "#92400e" },
  suspended: { bg: "#fef2f2", color: "#991b1b" },
  pro: { bg: "#fff7ed", color: "#9a3412" },
  free: { bg: "#f3f4f6", color: "#374151" },
  blacklisted: { bg: "#fef2f2", color: "#991b1b" },
};

interface StatusBadgeProps {
  label: string;
  variant: BadgeVariant;
}

export default function StatusBadge({ label, variant }: StatusBadgeProps) {
  const style = variantStyles[variant] || variantStyles.active;

  return (
    <span
      style={{
        display: "inline-block",
        padding: "2px 12px",
        borderRadius: "12px",
        fontSize: "12px",
        fontWeight: 600,
        background: style.bg,
        color: style.color,
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </span>
  );
}
