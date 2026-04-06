"use client";

import { useEffect, useState } from "react";
import { apiGet } from "../lib/api";

interface ServiceProviderDetailsModalProps {
  providerId: string;
  onClose: () => void;
}

export default function ServiceProviderDetailsModal({
  providerId,
  onClose,
}: ServiceProviderDetailsModalProps) {
  const [provider, setProvider] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        setIsLoading(true);
        const data = await apiGet<any>(`/service-providers/${providerId}`);
        setProvider(data);
      } catch (err) {
        console.error("Failed to fetch service provider details", err);
        setError("Could not load service provider profile.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDetails();
  }, [providerId]);

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
        {/* Header */}
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
            Service Provider Profile
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

        {/* Content */}
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
                Loading profile data...
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
          ) : provider ? (
            <div style={{ display: "flex", gap: "32px", flexWrap: "wrap" }}>
              {/* Left Column: Personal info */}
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
                    {provider.user_id?.profile_photo &&
                    provider.user_id.profile_photo !== "string" ? (
                      <img
                        src={provider.user_id.profile_photo}
                        alt="Profile"
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    ) : (
                      "👤"
                    )}
                  </div>
                  <h3
                    style={{
                      margin: "0 0 4px 0",
                      fontSize: "20px",
                      fontWeight: 700,
                    }}
                  >
                    {provider.user_id?.name || "Unknown Provider"}
                  </h3>
                  <p
                    style={{
                      margin: 0,
                      fontSize: "14px",
                      color: "#4b5563",
                    }}
                  >
                    {provider.job_title || "Service Provider"}
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
                      background:
                        provider.approval_status === "approved"
                          ? "#dcfce7"
                          : provider.approval_status === "pending"
                          ? "#fef3c7"
                          : "#fef2f2",
                      color:
                        provider.approval_status === "approved"
                          ? "#166534"
                          : provider.approval_status === "pending"
                          ? "#92400e"
                          : "#991b1b",
                      border: `1px solid ${
                        provider.approval_status === "approved"
                          ? "#bbf7d0"
                          : provider.approval_status === "pending"
                          ? "#fde68a"
                          : "#fecaca"
                      }`,
                    }}
                  >
                    {provider.approval_status}
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
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "14px" }}>
                    <div>
                      <span style={{ color: "#6b7280", marginRight: "6px" }}>📧</span>
                      <a href={`mailto:${provider.user_id?.email}`} style={{ color: "#111827", textDecoration: "none" }}>
                        {provider.user_id?.email || "N/A"}
                      </a>
                    </div>
                    <div>
                      <span style={{ color: "#6b7280", marginRight: "6px" }}>📞</span>
                      <a href={`tel:${provider.user_id?.phone}`} style={{ color: "#111827", textDecoration: "none" }}>
                        {provider.user_id?.phone || "N/A"}
                        {provider.user_id?.is_phone_verified && (
                          <span style={{ color: "#10b981", marginLeft: "4px", fontSize: "12px" }}>✓</span>
                        )}
                      </a>
                    </div>
                    <div>
                      <span style={{ color: "#6b7280", marginRight: "6px" }}>📍</span>
                      <span style={{ color: "#111827" }}>
                        {provider.current_location ||
                          provider.user_id?.addresses?.[0]?.city ||
                          "Location N/A"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Professional info */}
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
                  Professional Details
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
                    <div style={{ fontSize: "12px", color: "#6b7280", marginBottom: "4px" }}>Experience</div>
                    <div style={{ fontSize: "15px", fontWeight: 500 }}>
                      {provider.experience_years ? `${provider.experience_years} Years` : "N/A"}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: "12px", color: "#6b7280", marginBottom: "4px" }}>Expected Price</div>
                    <div style={{ fontSize: "15px", fontWeight: 500 }}>
                      {provider.expected_price ? `₹${provider.expected_price}` : "N/A"}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: "12px", color: "#6b7280", marginBottom: "4px" }}>Availability</div>
                    <div style={{ fontSize: "15px", fontWeight: 500, textTransform: "capitalize" }}>
                      {provider.availability || "N/A"}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: "12px", color: "#6b7280", marginBottom: "4px" }}>Hourly Rate</div>
                    <div style={{ fontSize: "15px", fontWeight: 500 }}>
                      {provider.hourly_rate ? `₹${provider.hourly_rate}/hr` : "N/A"}
                    </div>
                  </div>
                </div>

                {provider.skills?.length > 0 && (
                  <div style={{ marginBottom: "24px" }}>
                    <div style={{ fontSize: "12px", color: "#6b7280", marginBottom: "8px" }}>Skills</div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                      {provider.skills.map((s: any, i: number) => (
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
                          {typeof s === "string" ? "Skill ID: " + s.slice(-4) : s.skill_name || "Skill"}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {provider.description && (
                  <div style={{ marginBottom: "24px" }}>
                    <div style={{ fontSize: "12px", color: "#6b7280", marginBottom: "8px" }}>Bio & Description</div>
                    <p style={{ margin: 0, fontSize: "14px", color: "#374151", lineHeight: 1.6 }}>
                      {provider.description}
                    </p>
                  </div>
                )}

                {provider.languages && provider.languages.length > 0 && (
                  <div style={{ marginBottom: "24px" }}>
                    <div style={{ fontSize: "12px", color: "#6b7280", marginBottom: "8px" }}>Languages</div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                      {provider.languages.map((lang: string, i: number) => (
                        <span
                          key={i}
                          style={{
                            background: "#fef3c7",
                            color: "#92400e",
                            padding: "4px 10px",
                            borderRadius: "6px",
                            fontSize: "12px",
                            fontWeight: 500,
                          }}
                        >
                          {lang}
                        </span>
                      ))}
                    </div>
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
                  Documents
                </h4>

                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {provider.resume_url && provider.resume_url !== "string" && (
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
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <span style={{ fontSize: "20px" }}>📄</span>
                        <span style={{ fontSize: "14px", fontWeight: 500 }}>Resume</span>
                      </div>
                      <a
                        href={provider.resume_url}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          fontSize: "13px",
                          color: "#2563eb",
                          textDecoration: "none",
                          fontWeight: 500,
                        }}
                      >
                        View External
                      </a>
                    </div>
                  )}

                  {provider.user_id?.identity_docs?.map((doc: any, i: number) => (
                    <div
                      key={i}
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
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <span style={{ fontSize: "20px" }}>🪪</span>
                        <div>
                          <div style={{ fontSize: "14px", fontWeight: 500 }}>{doc.document_type || "Document"}</div>
                          <div style={{ fontSize: "12px", color: "#6b7280" }}>{doc.document_number}</div>
                        </div>
                      </div>
                      
                      {doc.document_url && doc.document_url !== "string" ? (
                        <a
                          href={doc.document_url}
                          target="_blank"
                          rel="noreferrer"
                          style={{
                            fontSize: "13px",
                            color: "#2563eb",
                            textDecoration: "none",
                            fontWeight: 500,
                          }}
                        >
                          View Document
                        </a>
                      ) : (
                        <span style={{ fontSize: "12px", color: "#9ca3af", background: "#f3f4f6", padding: "2px 8px", borderRadius: "4px" }}>
                          No File
                        </span>
                      )}
                    </div>
                  ))}

                  {(!provider.user_id?.identity_docs || provider.user_id.identity_docs.length === 0) && (!provider.resume_url || provider.resume_url === "string") && (
                    <div style={{ fontSize: "13px", color: "#6b7280", fontStyle: "italic" }}>
                      No documents available for this provider.
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
