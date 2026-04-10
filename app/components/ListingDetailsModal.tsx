"use client";

import { useEffect, useState } from "react";
import { apiGet } from "../lib/api";

interface ListingDetailsModalProps {
  listingId: string;
  onClose: () => void;
}

export default function ListingDetailsModal({
  listingId,
  onClose,
}: ListingDetailsModalProps) {
  const [listing, setListing] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        setIsLoading(true);
        const data = await apiGet<any>(`/listings/${listingId}`);
        setListing(data);
      } catch (err) {
        console.error("Failed to fetch listing details", err);
        setError("Could not load listing details.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDetails();
  }, [listingId]);

  const getStatusColor = (status: string) => {
    if (status === "approved") {
      return { bg: "#dcfce7", border: "#bbf7d0", text: "#166534" };
    }
    if (status === "pending") {
      return { bg: "#fef3c7", border: "#fde68a", text: "#92400e" };
    }
    return { bg: "#fef2f2", border: "#fecaca", text: "#991b1b" };
  };

  const statusColors = listing?.approval_status
    ? getStatusColor(listing.approval_status)
    : { bg: "#fef2f2", border: "#fecaca", text: "#991b1b" };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 2000,
        padding: "20px",
      }}
    >
      <div
        style={{
          background: "#ffffff",
          borderRadius: "16px",
          width: "100%",
          maxWidth: "800px",
          maxHeight: "90vh",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 25px 60px rgba(0,0,0,0.2)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            padding: "20px 24px",
            borderBottom: "1px solid #e5e7eb",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "#fafafa",
          }}
        >
          <h2 style={{ margin: 0, fontSize: "18px", fontWeight: 700 }}>
            Listing Details
          </h2>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              fontSize: "20px",
              cursor: "pointer",
              color: "#6b7280",
              padding: "4px",
            }}
          >
            &times;
          </button>
        </div>

        <div
          style={{
            padding: "24px",
            overflowY: "auto",
            flex: 1,
          }}
        >
          {isLoading ? (
            <div style={{ textAlign: "center", padding: "40px 0" }}>
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  border: "3px solid #e5e7eb",
                  borderTopColor: "#2d6a4f",
                  borderRadius: "50%",
                  margin: "0 auto",
                  animation: "spin 1s linear infinite",
                }}
              />
              <p style={{ marginTop: "16px", color: "#6b7280", fontSize: "14px" }}>
                Loading listing data...
              </p>
              <style>{`
                @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
              `}</style>
            </div>
          ) : error ? (
            <div
              style={{
                background: "#fef2f2",
                color: "#dc2626",
                padding: "16px",
                borderRadius: "8px",
                border: "1px solid #fecaca",
                fontSize: "14px",
                textAlign: "center",
              }}
            >
              {error}
            </div>
          ) : listing ? (
            <div style={{ display: "flex", gap: "32px", flexWrap: "wrap" }}>
              <div style={{ flex: "1 1 250px" }}>
                <div style={{ textAlign: "center", marginBottom: "24px" }}>
                  <div
                    style={{
                      width: "120px",
                      height: "120px",
                      borderRadius: "50%",
                      background: "#e5e7eb",
                      margin: "0 auto 16px auto",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "40px",
                      boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                      overflow: "hidden",
                    }}
                  >
                    {listing.image || listing.cover_image ? (
                      <img
                        src={listing.image || listing.cover_image}
                        alt="Listing"
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    ) : (
                      "📋"
                    )}
                  </div>
                  <h3
                    style={{
                      margin: "0 0 4px 0",
                      fontSize: "20px",
                      fontWeight: 700,
                    }}
                  >
                    {listing.title || "Untitled Listing"}
                  </h3>
                  <p
                    style={{
                      margin: 0,
                      fontSize: "14px",
                      color: "#4b5563",
                    }}
                  >
                    {listing.created_by?.name || "Unknown Employer"}
                  </p>

                  <div
                    style={{
                      display: "inline-block",
                      marginTop: "12px",
                      padding: "4px 12px",
                      borderRadius: "9999px",
                      fontSize: "12px",
                      fontWeight: 600,
                      textTransform: "uppercase",
                      background: statusColors.bg,
                      color: statusColors.text,
                      border: `1px solid ${statusColors.border}`,
                    }}
                  >
                    {listing.approval_status || "unknown"}
                  </div>
                </div>

                <div
                  style={{
                    background: "#f9fafb",
                    padding: "16px",
                    borderRadius: "12px",
                    border: "1px solid #f3f4f6",
                  }}
                >
                  <h4
                    style={{
                      margin: "0 0 12px 0",
                      fontSize: "13px",
                      fontWeight: 600,
                      color: "#9ca3af",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                    }}
                  >
                    Contact Info
                  </h4>
                  <div
                    style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "14px" }}
                  >
                    {listing.created_by?.email && (
                      <div>
                        <span style={{ color: "#6b7280", marginRight: "6px" }}>📧</span>
                        <a
                          href={`mailto:${listing.created_by.email}`}
                          style={{ color: "#111827", textDecoration: "none" }}
                        >
                          {listing.created_by.email}
                        </a>
                      </div>
                    )}
                    {listing.created_by?.phone && (
                      <div>
                        <span style={{ color: "#6b7280", marginRight: "6px" }}>📞</span>
                        <a
                          href={`tel:${listing.created_by.phone}`}
                          style={{ color: "#111827", textDecoration: "none" }}
                        >
                          {listing.created_by.phone}
                        </a>
                      </div>
                    )}
                    <div>
                      <span style={{ color: "#6b7280", marginRight: "6px" }}>📍</span>
                      <span style={{ color: "#111827" }}>
                        {listing.address?.city || "Location N/A"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ flex: "2 1 400px" }}>
                <h4
                  style={{
                    margin: "0 0 12px 0",
                    fontSize: "15px",
                    fontWeight: 600,
                    borderBottom: "1px solid #e5e7eb",
                    paddingBottom: "8px",
                  }}
                >
                  Job Details
                </h4>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "16px",
                    marginBottom: "24px",
                  }}
                >
                  <div>
                    <div style={{ fontSize: "12px", color: "#6b7280", marginBottom: "4px" }}>
                      Job Type
                    </div>
                    <div style={{ fontSize: "15px", fontWeight: 500, textTransform: "capitalize" }}>
                      {listing.job_details?.job_type || "N/A"}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: "12px", color: "#6b7280", marginBottom: "4px" }}>Salary Range</div>
                    <div style={{ fontSize: "15px", fontWeight: 500 }}>
                      {listing.job_details?.salary_min && listing.job_details?.salary_max
                        ? `₹${listing.job_details.salary_min.toLocaleString()} - ₹${listing.job_details.salary_max.toLocaleString()}`
                        : "N/A"}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: "12px", color: "#6b7280", marginBottom: "4px" }}>
                      Experience Required
                    </div>
                    <div style={{ fontSize: "15px", fontWeight: 500, textTransform: "capitalize" }}>
                      {listing.experience_required ||
                        listing.experience ||
                        listing.experience_years ||
                        "N/A"}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: "12px", color: "#6b7280", marginBottom: "4px" }}>
                      Positions Available
                    </div>
                    <div style={{ fontSize: "15px", fontWeight: 500 }}>
                      {listing.positions_available || listing.vacancies || "1"}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: "12px", color: "#6b7280", marginBottom: "4px" }}>
                      Application Deadline
                    </div>
                    <div style={{ fontSize: "15px", fontWeight: 500 }}>
                      {listing.application_deadline
                        ? new Date(listing.application_deadline).toLocaleDateString()
                        : "N/A"}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: "12px", color: "#6b7280", marginBottom: "4px" }}>Posted Date</div>
                    <div style={{ fontSize: "15px", fontWeight: 500 }}>
                      {listing.createdAt
                        ? new Date(listing.createdAt).toLocaleDateString()
                        : "N/A"}
                    </div>
                  </div>
                </div>

                {(listing.job_details?.required_skills?.length > 0) && (
                  <div style={{ marginBottom: "24px" }}>
                    <div style={{ fontSize: "12px", color: "#6b7280", marginBottom: "8px" }}>Required Skills</div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                      {listing.job_details.required_skills.map((s: any, i: number) => (
                        <span
                          key={i}
                          style={{
                            background: "#e0e7ff",
                            color: "#4f46e5",
                            padding: "4px 10px",
                            borderRadius: "6px",
                            fontSize: "12px",
                            fontWeight: 500,
                          }}
                        >
                          {s.skill_name || "Skill"}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {listing.description && (
                  <div style={{ marginBottom: "24px" }}>
                    <div style={{ fontSize: "12px", color: "#6b7280", marginBottom: "8px" }}>Description</div>
                    <p
                      style={{ margin: 0, fontSize: "14px", color: "#374151", lineHeight: 1.6 }}
                    >
                      {listing.description}
                    </p>
                  </div>
                )}

                {listing.requirements && (
                  <div style={{ marginBottom: "24px" }}>
                    <div style={{ fontSize: "12px", color: "#6b7280", marginBottom: "8px" }}>
                      Requirements
                    </div>
                    <p
                      style={{ margin: 0, fontSize: "14px", color: "#374151", lineHeight: 1.6 }}
                    >
                      {listing.requirements}
                    </p>
                  </div>
                )}

                {listing.benefits && (
                  <div style={{ marginBottom: "24px" }}>
                    <div style={{ fontSize: "12px", color: "#6b7280", marginBottom: "8px" }}>Benefits</div>
                    <p
                      style={{ margin: 0, fontSize: "14px", color: "#374151", lineHeight: 1.6 }}
                    >
                      {listing.benefits}
                    </p>
                  </div>
                )}

                <h4
                  style={{
                    margin: "0 0 12px 0",
                    fontSize: "15px",
                    fontWeight: 600,
                    borderBottom: "1px solid #e5e7eb",
                    paddingBottom: "8px",
                  }}
                >
                  Additional Info
                </h4>

                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "12px 16px",
                      background: "#fafafa",
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                    }}
                  >
                    <div style={{ fontSize: "14px", fontWeight: 500 }}>Flagged Status</div>
                    <span
                      style={{
                        fontSize: "13px",
                        fontWeight: 500,
                        color: listing.is_flagged ? "#dc2626" : "#22c55e",
                      }}
                    >
                      {listing.is_flagged ? "⚠️ Flagged" : "✅ Clean"}
                    </span>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "12px 16px",
                      background: "#fafafa",
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                    }}
                  >
                    <div style={{ fontSize: "14px", fontWeight: 500 }}>Applications</div>
                    <span style={{ fontSize: "13px", fontWeight: 500, color: "#111827" }}>
                      {listing.application_count || listing.applications_count || listing.applications?.length || 0}
                    </span>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "12px 16px",
                      background: "#fafafa",
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                    }}
                  >
                    <div style={{ fontSize: "14px", fontWeight: 500 }}>Views</div>
                    <span style={{ fontSize: "13px", fontWeight: 500, color: "#111827" }}>
                      {listing.views || listing.view_count || 0}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}