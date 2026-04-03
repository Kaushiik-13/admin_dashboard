"use client";

import { useEffect, useState } from "react";
import { apiGet } from "../lib/api";

interface WorkerDetailsModalProps {
  workerId: string;
  onClose: () => void;
}

export default function WorkerDetailsModal({
  workerId,
  onClose,
}: WorkerDetailsModalProps) {
  const [worker, setWorker] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        setIsLoading(true);
        const data = await apiGet<any>(`/workers/${workerId}`);
        setWorker(data);
      } catch (err) {
        console.error("Failed to fetch worker details", err);
        setError("Could not load worker profile.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDetails();
  }, [workerId]);

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
            Worker Profile
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
          ) : worker ? (
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
                    {worker.user_id?.profile_photo &&
                    worker.user_id.profile_photo !== "string" ? (
                      <img
                        src={worker.user_id.profile_photo}
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
                    {worker.user_id?.name || "Unknown Worker"}
                  </h3>
                  <p
                    style={{
                      margin: 0,
                      fontSize: "14px",
                      color: "#4b5563",
                    }}
                  >
                    {worker.job_title || "General Worker"}
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
                        worker.approval_status === "approved"
                          ? "#dcfce7"
                          : worker.approval_status === "pending"
                          ? "#fef3c7"
                          : "#fef2f2",
                      color:
                        worker.approval_status === "approved"
                          ? "#166534"
                          : worker.approval_status === "pending"
                          ? "#92400e"
                          : "#991b1b",
                      border: `1px solid ${
                        worker.approval_status === "approved"
                          ? "#bbf7d0"
                          : worker.approval_status === "pending"
                          ? "#fde68a"
                          : "#fecaca"
                      }`,
                    }}
                  >
                    {worker.approval_status}
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
                      <a href={`mailto:${worker.user_id?.email}`} style={{ color: "#111827", textDecoration: "none" }}>
                        {worker.user_id?.email || "N/A"}
                      </a>
                    </div>
                    <div>
                      <span style={{ color: "#6b7280", marginRight: "6px" }}>📞</span>
                      <a href={`tel:${worker.user_id?.phone}`} style={{ color: "#111827", textDecoration: "none" }}>
                        {worker.user_id?.phone || "N/A"}
                        {worker.user_id?.is_phone_verified && (
                          <span style={{ color: "#10b981", marginLeft: "4px", fontSize: "12px" }}>✓</span>
                        )}
                      </a>
                    </div>
                    <div>
                      <span style={{ color: "#6b7280", marginRight: "6px" }}>📍</span>
                      <span style={{ color: "#111827" }}>
                        {worker.current_location ||
                          worker.user_id?.addresses?.[0]?.city ||
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
                      {worker.experience_years ? `${worker.experience_years} Years` : "N/A"}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: "12px", color: "#6b7280", marginBottom: "4px" }}>Expected Salary</div>
                    <div style={{ fontSize: "15px", fontWeight: 500 }}>
                      {worker.expected_salary ? `₹${worker.expected_salary.toLocaleString()}` : "N/A"}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: "12px", color: "#6b7280", marginBottom: "4px" }}>Availability</div>
                    <div style={{ fontSize: "15px", fontWeight: 500, textTransform: "capitalize" }}>
                      {worker.availability || "N/A"}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: "12px", color: "#6b7280", marginBottom: "4px" }}>Hourly Rate</div>
                    <div style={{ fontSize: "15px", fontWeight: 500 }}>
                      {worker.hourly_rate ? `₹${worker.hourly_rate}/hr` : "N/A"}
                    </div>
                  </div>
                </div>

                {worker.skills?.length > 0 && (
                  <div style={{ marginBottom: "24px" }}>
                    <div style={{ fontSize: "12px", color: "#6b7280", marginBottom: "8px" }}>Skills</div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                      {worker.skills.map((s: any, i: number) => (
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

                {worker.description && (
                  <div style={{ marginBottom: "24px" }}>
                    <div style={{ fontSize: "12px", color: "#6b7280", marginBottom: "8px" }}>Bio & Description</div>
                    <p style={{ margin: 0, fontSize: "14px", color: "#374151", lineHeight: 1.6 }}>
                      {worker.description}
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
                  Documents
                </h4>

                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {worker.resume_url && worker.resume_url !== "string" && (
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
                        href={worker.resume_url}
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

                  {worker.user_id?.identity_docs?.map((doc: any, i: number) => (
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
                         View Safe
                       </a>
                      ) : (
                        <span style={{ fontSize: "12px", color: "#9ca3af", background: "#f3f4f6", padding: "2px 8px", borderRadius: "4px" }}>
                          No File
                        </span>
                      )}
                    </div>
                  ))}

                  {(!worker.user_id?.identity_docs || worker.user_id.identity_docs.length === 0) && (!worker.resume_url || worker.resume_url === "string") && (
                    <div style={{ fontSize: "13px", color: "#6b7280", fontStyle: "italic" }}>
                      No documents available for this worker.
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
