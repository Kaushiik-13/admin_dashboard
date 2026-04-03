"use client";

type ButtonVariant =
  | "approve"
  | "reject"
  | "view"
  | "suspend"
  | "verify"
  | "flag"
  | "manual-review";

const variantStyles: Record<
  ButtonVariant,
  { bg: string; color: string; border: string }
> = {
  approve: { bg: "#dcfce7", color: "#166534", border: "#bbf7d0" },
  reject: { bg: "#fef2f2", color: "#991b1b", border: "#fecaca" },
  view: { bg: "transparent", color: "#2d6a4f", border: "#d1fae5" },
  suspend: { bg: "transparent", color: "#ea580c", border: "#fed7aa" },
  verify: { bg: "#dbeafe", color: "#1e40af", border: "#bfdbfe" },
  flag: { bg: "#fef2f2", color: "#991b1b", border: "#fecaca" },
  "manual-review": { bg: "#fef3c7", color: "#92400e", border: "#fde68a" },
};

interface ActionButtonProps {
  label: string;
  variant: ButtonVariant;
  onClick?: () => void;
}

export default function ActionButton({
  label,
  variant,
  onClick,
}: ActionButtonProps) {
  const style = variantStyles[variant] || variantStyles.view;

  return (
    <button
      onClick={onClick}
      style={{
        display: "inline-block",
        padding: "4px 14px",
        borderRadius: "4px",
        fontSize: "12px",
        fontWeight: 500,
        background: style.bg,
        color: style.color,
        border: `1px solid ${style.border}`,
        cursor: "pointer",
        whiteSpace: "nowrap",
        transition: "opacity 0.15s ease",
      }}
      onMouseEnter={(e) => {
        (e.target as HTMLButtonElement).style.opacity = "0.8";
      }}
      onMouseLeave={(e) => {
        (e.target as HTMLButtonElement).style.opacity = "1";
      }}
    >
      {label}
    </button>
  );
}
