"use client";

import { useState, useEffect, useCallback } from "react";
import { apiGet, apiPost, apiPatch, apiDelete } from "../../lib/api";
import { validateMinLength, validateMaxLength } from "../../lib/validation";

const moderationSettings = [
  { label: "Auto-approve verified employers", key: "autoApprove" },
  { label: "Require Aadhaar for workers", key: "requireAadhaar" },
  { label: "Flag jobs below ₹500/day", key: "flagLowPay" },
  { label: "Allow international job posts", key: "allowInternational" },
];

const matchingDefaults = [
  { label: "Default search radius (km)", key: "searchRadius", value: 5 },
  { label: "Max radius (km)", key: "maxRadius", value: 25 },
  { label: "Urgent job expiry (hours)", key: "urgentExpiry", value: 24 },
];

interface Language {
  _id: string;
  language_name: string;
  is_active: boolean;
}

interface Skill {
  _id: string;
  skill_name: string;
  is_active: boolean;
}

interface EmploymentType {
  _id: string;
  type_name: string;
  is_active: boolean;
}

export default function ConfigurationPage() {
  const [checks, setChecks] = useState<Record<string, boolean>>({
    autoApprove: false,
    requireAadhaar: false,
    flagLowPay: false,
    allowInternational: false,
  });

  const [matchValues, setMatchValues] = useState<Record<string, number>>({
    searchRadius: 5,
    maxRadius: 25,
    urgentExpiry: 24,
  });

  // ===== LANGUAGE STATE =====
  const [languages, setLanguages] = useState<Language[]>([]);
  const [langLoading, setLangLoading] = useState(true);
  const [langError, setLangError] = useState("");
  const [langInputError, setLangInputError] = useState("");
  const [showAddInput, setShowAddInput] = useState(false);
  const [newLangName, setNewLangName] = useState("");
  const [langActionLoading, setLangActionLoading] = useState(false);

  const fetchLanguages = useCallback(async () => {
    try {
      setLangError("");
      const data = await apiGet<Language[]>("/languages");
      setLanguages(data);
    } catch (err: unknown) {
      setLangError(err instanceof Error ? err.message : "Failed to load languages");
    } finally {
      setLangLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLanguages();
  }, [fetchLanguages]);

  const handleToggleLanguage = async (lang: Language) => {
    setLangActionLoading(true);
    try {
      await apiPatch(`/languages/${lang._id}`, { is_active: !lang.is_active });
      setLanguages((prev) =>
        prev.map((l) => (l._id === lang._id ? { ...l, is_active: !l.is_active } : l))
      );
    } catch (err: unknown) {
      setLangError(err instanceof Error ? err.message : "Failed to update language");
    } finally {
      setLangActionLoading(false);
    }
  };

  const handleAddLanguage = async () => {
    const trimmed = newLangName.trim();
    const minErr = validateMinLength(trimmed, 2, "Language name");
    if (minErr) {
      setLangInputError(minErr);
      return;
    }
    const maxErr = validateMaxLength(trimmed, 30, "Language name");
    if (maxErr) {
      setLangInputError(maxErr);
      return;
    }
    setLangInputError("");
    setLangActionLoading(true);
    try {
      await apiPost("/languages", { language_name: trimmed, is_active: true });
      setNewLangName("");
      setShowAddInput(false);
      await fetchLanguages();
    } catch (err: unknown) {
      setLangError(err instanceof Error ? err.message : "Failed to add language");
    } finally {
      setLangActionLoading(false);
    }
  };

  const handleRemoveLanguage = async (id: string) => {
    if (!confirm("Remove this language?")) return;
    setLangActionLoading(true);
    try {
      await apiDelete(`/languages/${id}`);
      setLanguages((prev) => prev.filter((l) => l._id !== id));
    } catch (err: unknown) {
      setLangError(err instanceof Error ? err.message : "Failed to remove language");
    } finally {
      setLangActionLoading(false);
    }
  };

  // ===== SKILLS STATE =====
  const [skills, setSkills] = useState<Skill[]>([]);
  const [skillLoading, setSkillLoading] = useState(true);
  const [skillError, setSkillError] = useState("");
  const [skillInputError, setSkillInputError] = useState("");
  const [showAddSkillInput, setShowAddSkillInput] = useState(false);
  const [newSkillName, setNewSkillName] = useState("");
  const [skillActionLoading, setSkillActionLoading] = useState(false);

  const fetchSkills = useCallback(async () => {
    try {
      setSkillError("");
      const data = await apiGet<Skill[]>("/skills");
      setSkills(data);
    } catch (err: unknown) {
      setSkillError(err instanceof Error ? err.message : "Failed to load skills");
    } finally {
      setSkillLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSkills();
  }, [fetchSkills]);

  const handleToggleSkill = async (skill: Skill) => {
    setSkillActionLoading(true);
    try {
      await apiPatch(`/skills/${skill._id}`, { is_active: !skill.is_active });
      setSkills((prev) =>
        prev.map((s) => (s._id === skill._id ? { ...s, is_active: !s.is_active } : s))
      );
    } catch (err: unknown) {
      setSkillError(err instanceof Error ? err.message : "Failed to update skill");
    } finally {
      setSkillActionLoading(false);
    }
  };

  const handleAddSkill = async () => {
    const trimmed = newSkillName.trim();
    const minErr = validateMinLength(trimmed, 2, "Skill name");
    if (minErr) {
      setSkillInputError(minErr);
      return;
    }
    const maxErr = validateMaxLength(trimmed, 50, "Skill name");
    if (maxErr) {
      setSkillInputError(maxErr);
      return;
    }
    setSkillInputError("");
    setSkillActionLoading(true);
    try {
      await apiPost("/skills", { skill_name: trimmed, is_active: true });
      setNewSkillName("");
      setShowAddSkillInput(false);
      await fetchSkills();
    } catch (err: unknown) {
      setSkillError(err instanceof Error ? err.message : "Failed to add skill");
    } finally {
      setSkillActionLoading(false);
    }
  };

  const handleRemoveSkill = async (id: string) => {
    if (!confirm("Remove this skill?")) return;
    setSkillActionLoading(true);
    try {
      await apiDelete(`/skills/${id}`);
      setSkills((prev) => prev.filter((s) => s._id !== id));
    } catch (err: unknown) {
      setSkillError(err instanceof Error ? err.message : "Failed to remove skill");
    } finally {
      setSkillActionLoading(false);
    }
  };

  // ===== EMPLOYMENT TYPES STATE (LOCAL ONLY IMPL) =====
  const [empTypes, setEmpTypes] = useState<EmploymentType[]>([
    { _id: "1", type_name: "Full-Time", is_active: true },
    { _id: "2", type_name: "Part-Time", is_active: true },
    { _id: "3", type_name: "Contract", is_active: false },
  ]);
  const [empTypeInputError, setEmpTypeInputError] = useState("");
  const [showAddEmpTypeInput, setShowAddEmpTypeInput] = useState(false);
  const [newEmpTypeName, setNewEmpTypeName] = useState("");

  const handleToggleEmpType = (empType: EmploymentType) => {
    setEmpTypes((prev) =>
      prev.map((t) => (t._id === empType._id ? { ...t, is_active: !t.is_active } : t))
    );
  };

  const handleAddEmpType = () => {
    const trimmed = newEmpTypeName.trim();
    if (trimmed.length < 2) {
      setEmpTypeInputError("Name must be at least 2 characters.");
      return;
    }
    setEmpTypeInputError("");
    setEmpTypes((prev) => [
      ...prev,
      { _id: Math.random().toString(36).substr(2, 9), type_name: trimmed, is_active: true },
    ]);
    setNewEmpTypeName("");
    setShowAddEmpTypeInput(false);
  };

  const handleRemoveEmpType = (id: string) => {
    if (!confirm("Remove this employment type?")) return;
    setEmpTypes((prev) => prev.filter((t) => t._id !== id));
  };

  return (
    <div>
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "24px",
        }}
      >
        <h1 style={{ fontSize: "22px", fontWeight: 700, margin: 0 }}>
          Platform Configuration
        </h1>
        <button
          style={{
            padding: "8px 20px",
            borderRadius: "6px",
            fontSize: "12px",
            fontWeight: 600,
            background: "#1a1a1a",
            color: "#ffffff",
            border: "none",
            cursor: "pointer",
          }}
        >
          Save All Changes
        </button>
      </div>

      {/* Settings Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "16px",
        }}
      >
        {/* Moderation Settings */}
        <div
          style={{
            background: "#ffffff",
            borderRadius: "8px",
            border: "1px solid #e5e7eb",
            padding: "20px 24px",
          }}
        >
          <h3
            style={{
              fontSize: "15px",
              fontWeight: 600,
              margin: "0 0 16px 0",
            }}
          >
            Moderation Settings
          </h3>
          <div
            style={{ display: "flex", flexDirection: "column", gap: "16px" }}
          >
            {moderationSettings.map((setting) => (
              <div
                key={setting.key}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "4px 0",
                  borderBottom: "1px solid #f3f4f6",
                }}
              >
                <span style={{ fontSize: "13px", color: "#374151" }}>
                  {setting.label}
                </span>
                <input
                  type="checkbox"
                  checked={checks[setting.key] || false}
                  onChange={(e) =>
                    setChecks({ ...checks, [setting.key]: e.target.checked })
                  }
                  style={{
                    width: "16px",
                    height: "16px",
                    cursor: "pointer",
                    accentColor: "#2d6a4f",
                  }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Matching Settings */}
        <div
          style={{
            background: "#ffffff",
            borderRadius: "8px",
            border: "1px solid #e5e7eb",
            padding: "20px 24px",
          }}
        >
          <h3
            style={{
              fontSize: "15px",
              fontWeight: 600,
              margin: "0 0 16px 0",
            }}
          >
            Matching Settings
          </h3>
          <div
            style={{ display: "flex", flexDirection: "column", gap: "16px" }}
          >
            {matchingDefaults.map((setting) => (
              <div
                key={setting.key}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "4px 0",
                  borderBottom: "1px solid #f3f4f6",
                }}
              >
                <span style={{ fontSize: "13px", color: "#374151" }}>
                  {setting.label}
                </span>
                <input
                  type="number"
                  value={matchValues[setting.key]}
                  onChange={(e) =>
                    setMatchValues({
                      ...matchValues,
                      [setting.key]: parseInt(e.target.value) || 0,
                    })
                  }
                  style={{
                    width: "60px",
                    padding: "4px 8px",
                    borderRadius: "4px",
                    border: "1px solid #e5e7eb",
                    fontSize: "13px",
                    textAlign: "center",
                    outline: "none",
                  }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Supported Languages */}
        <div
          style={{
            background: "#ffffff",
            borderRadius: "8px",
            border: "1px solid #e5e7eb",
            padding: "20px 24px",
          }}
        >
          <h3
            style={{
              fontSize: "15px",
              fontWeight: 600,
              margin: "0 0 16px 0",
            }}
          >
            Supported Languages
          </h3>

          {/* Error */}
          {langError && (
            <div
              style={{
                background: "#fef2f2",
                border: "1px solid #fecaca",
                borderRadius: "6px",
                padding: "8px 12px",
                marginBottom: "12px",
                fontSize: "12px",
                color: "#dc2626",
              }}
            >
              {langError}
            </div>
          )}

          {/* Loading */}
          {langLoading ? (
            <div style={{ fontSize: "13px", color: "#9ca3af", padding: "8px 0" }}>
              Loading languages…
            </div>
          ) : (
            <>
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "8px",
                  marginBottom: "16px",
                }}
              >
                {languages.map((lang) => (
                  <span
                    key={lang._id}
                    style={{
                      padding: "4px 10px 4px 14px",
                      borderRadius: "16px",
                      fontSize: "12px",
                      fontWeight: 500,
                      background: lang.is_active ? "#dcfce7" : "#f3f4f6",
                      color: lang.is_active ? "#166534" : "#6b7280",
                      border: `1px solid ${
                        lang.is_active ? "#bbf7d0" : "#e5e7eb"
                      }`,
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      cursor: langActionLoading ? "wait" : "pointer",
                      transition: "all 0.15s ease",
                      userSelect: "none",
                    }}
                    onClick={() => !langActionLoading && handleToggleLanguage(lang)}
                  >
                    {lang.language_name}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!langActionLoading) handleRemoveLanguage(lang._id);
                      }}
                      style={{
                        background: "none",
                        border: "none",
                        cursor: langActionLoading ? "wait" : "pointer",
                        fontSize: "14px",
                        color: lang.is_active ? "#166534" : "#9ca3af",
                        padding: "0 2px",
                        lineHeight: 1,
                        opacity: 0.6,
                      }}
                      title="Remove language"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>

              {/* Add Language */}
              {showAddInput ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                    <input
                      type="text"
                      value={newLangName}
                      onChange={(e) => {
                        setNewLangName(e.target.value);
                        setLangInputError("");
                      }}
                      onKeyDown={(e) => e.key === "Enter" && handleAddLanguage()}
                      placeholder="Language name"
                      autoFocus
                      style={{
                        padding: "6px 12px",
                        borderRadius: "6px",
                        border: `1.5px solid ${langInputError ? "#ef4444" : "#e5e7eb"}`,
                        fontSize: "12px",
                        outline: "none",
                        width: "140px",
                      }}
                    />
                    <button
                      onClick={handleAddLanguage}
                      disabled={langActionLoading || !newLangName.trim()}
                      style={{
                        padding: "6px 14px",
                        borderRadius: "6px",
                        fontSize: "12px",
                      fontWeight: 600,
                      background: "#1a1a1a",
                      color: "#ffffff",
                      border: "none",
                      cursor: langActionLoading ? "wait" : "pointer",
                      opacity: !newLangName.trim() ? 0.5 : 1,
                      }}
                    >
                      Add
                    </button>
                    <button
                      onClick={() => {
                        setShowAddInput(false);
                        setNewLangName("");
                        setLangInputError("");
                      }}
                      style={{
                        padding: "6px 10px",
                        borderRadius: "6px",
                        fontSize: "12px",
                        background: "none",
                        color: "#6b7280",
                        border: "1px solid #e5e7eb",
                        cursor: "pointer",
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                  {langInputError && (
                    <p style={{ fontSize: "11px", color: "#ef4444", margin: 0 }}>
                      {langInputError}
                    </p>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => setShowAddInput(true)}
                  style={{
                    padding: "6px 16px",
                    borderRadius: "6px",
                    fontSize: "12px",
                    fontWeight: 500,
                    background: "#ffffff",
                    color: "#374151",
                    border: "1px solid #e5e7eb",
                    cursor: "pointer",
                  }}
                >
                  + Add Language
                </button>
              )}
            </>
          )}
        </div>

        {/* Skills */}
        <div
          style={{
            background: "#ffffff",
            borderRadius: "8px",
            border: "1px solid #e5e7eb",
            padding: "20px 24px",
          }}
        >
          <h3
            style={{
              fontSize: "15px",
              fontWeight: 600,
              margin: "0 0 16px 0",
            }}
          >
            Skills
          </h3>

          {skillError && (
            <div
              style={{
                background: "#fef2f2",
                border: "1px solid #fecaca",
                borderRadius: "6px",
                padding: "8px 12px",
                marginBottom: "12px",
                fontSize: "12px",
                color: "#dc2626",
              }}
            >
              {skillError}
            </div>
          )}

          {skillLoading ? (
            <div style={{ fontSize: "13px", color: "#9ca3af", padding: "8px 0" }}>
              Loading skills…
            </div>
          ) : (
            <>
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "8px",
                  marginBottom: "16px",
                }}
              >
                {skills.map((skill) => (
                  <span
                    key={skill._id}
                    style={{
                      padding: "4px 10px 4px 14px",
                      borderRadius: "16px",
                      fontSize: "12px",
                      fontWeight: 500,
                      background: skill.is_active ? "#dcfce7" : "#f3f4f6",
                      color: skill.is_active ? "#166534" : "#6b7280",
                      border: `1px solid ${
                        skill.is_active ? "#bbf7d0" : "#e5e7eb"
                      }`,
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      cursor: skillActionLoading ? "wait" : "pointer",
                      transition: "all 0.15s ease",
                      userSelect: "none",
                    }}
                    onClick={() => !skillActionLoading && handleToggleSkill(skill)}
                  >
                    {skill.skill_name}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!skillActionLoading) handleRemoveSkill(skill._id);
                      }}
                      style={{
                        background: "none",
                        border: "none",
                        cursor: skillActionLoading ? "wait" : "pointer",
                        fontSize: "14px",
                        color: skill.is_active ? "#166534" : "#9ca3af",
                        padding: "0 2px",
                        lineHeight: 1,
                        opacity: 0.6,
                      }}
                      title="Remove skill"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>

              {showAddSkillInput ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                    <input
                      type="text"
                      value={newSkillName}
                      onChange={(e) => {
                        setNewSkillName(e.target.value);
                        setSkillInputError("");
                      }}
                      onKeyDown={(e) => e.key === "Enter" && handleAddSkill()}
                      placeholder="Skill name"
                      autoFocus
                      style={{
                        padding: "6px 12px",
                        borderRadius: "6px",
                        border: `1.5px solid ${skillInputError ? "#ef4444" : "#e5e7eb"}`,
                        fontSize: "12px",
                        outline: "none",
                      width: "140px",
                    }}
                  />
                  <button
                    onClick={handleAddSkill}
                    disabled={skillActionLoading || !newSkillName.trim()}
                    style={{
                      padding: "6px 14px",
                      borderRadius: "6px",
                      fontSize: "12px",
                      fontWeight: 600,
                      background: "#1a1a1a",
                      color: "#ffffff",
                      border: "none",
                      cursor: skillActionLoading ? "wait" : "pointer",
                      opacity: !newSkillName.trim() ? 0.5 : 1,
                    }}
                  >
                    Add
                  </button>
                  <button
                    onClick={() => {
                      setShowAddSkillInput(false);
                      setNewSkillName("");
                      setSkillInputError("");
                    }}
                    style={{
                      padding: "6px 10px",
                      borderRadius: "6px",
                      fontSize: "12px",
                      background: "none",
                      color: "#6b7280",
                      border: "1px solid #e5e7eb",
                      cursor: "pointer",
                    }}
                  >
                    Cancel
                  </button>
                </div>
                {skillInputError && (
                  <p style={{ fontSize: "11px", color: "#ef4444", margin: 0 }}>
                    {skillInputError}
                  </p>
                )}
              </div>
            ) : (
              <button
                onClick={() => setShowAddSkillInput(true)}
                style={{
                  padding: "6px 16px",
                  borderRadius: "6px",
                  fontSize: "12px",
                  fontWeight: 500,
                  background: "#ffffff",
                  color: "#374151",
                  border: "1px solid #e5e7eb",
                  cursor: "pointer",
                }}
              >
                + Add Skill
              </button>
            )}
            </>
          )}
        </div>

        {/* Employment Types */}
        <div
          style={{
            background: "#ffffff",
            borderRadius: "8px",
            border: "1px solid #e5e7eb",
            padding: "20px 24px",
          }}
        >
          <h3
            style={{
              fontSize: "15px",
              fontWeight: 600,
              margin: "0 0 16px 0",
            }}
          >
            Employment Types
          </h3>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "8px",
              marginBottom: "16px",
            }}
          >
            {empTypes.map((emp) => (
              <span
                key={emp._id}
                style={{
                  padding: "4px 10px 4px 14px",
                  borderRadius: "16px",
                  fontSize: "12px",
                  fontWeight: 500,
                  background: emp.is_active ? "#dcfce7" : "#f3f4f6",
                  color: emp.is_active ? "#166534" : "#6b7280",
                  border: `1px solid ${
                    emp.is_active ? "#bbf7d0" : "#e5e7eb"
                  }`,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                  userSelect: "none",
                }}
                onClick={() => handleToggleEmpType(emp)}
              >
                {emp.type_name}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveEmpType(emp._id);
                  }}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontSize: "14px",
                    color: emp.is_active ? "#166534" : "#9ca3af",
                    padding: "0 2px",
                    lineHeight: 1,
                    opacity: 0.6,
                  }}
                  title="Remove employment type"
                >
                  ×
                </button>
              </span>
            ))}
          </div>

          {showAddEmpTypeInput ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                <input
                  type="text"
                  value={newEmpTypeName}
                  onChange={(e) => {
                    setNewEmpTypeName(e.target.value);
                    setEmpTypeInputError("");
                  }}
                  onKeyDown={(e) => e.key === "Enter" && handleAddEmpType()}
                  placeholder="e.g. Full-Time"
                  autoFocus
                  style={{
                    padding: "6px 12px",
                    borderRadius: "6px",
                    border: `1.5px solid ${empTypeInputError ? "#ef4444" : "#e5e7eb"}`,
                    fontSize: "12px",
                    outline: "none",
                    width: "140px",
                  }}
                />
                <button
                  onClick={handleAddEmpType}
                  disabled={!newEmpTypeName.trim()}
                  style={{
                    padding: "6px 14px",
                    borderRadius: "6px",
                    fontSize: "12px",
                    fontWeight: 600,
                    background: "#1a1a1a",
                    color: "#ffffff",
                    border: "none",
                    cursor: "pointer",
                    opacity: !newEmpTypeName.trim() ? 0.5 : 1,
                  }}
                >
                  Add
                </button>
                <button
                  onClick={() => {
                    setShowAddEmpTypeInput(false);
                    setNewEmpTypeName("");
                    setEmpTypeInputError("");
                  }}
                  style={{
                    padding: "6px 10px",
                    borderRadius: "6px",
                    fontSize: "12px",
                    background: "none",
                    color: "#6b7280",
                    border: "1px solid #e5e7eb",
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
              </div>
              {empTypeInputError && (
                <p style={{ fontSize: "11px", color: "#ef4444", margin: 0 }}>
                  {empTypeInputError}
                </p>
              )}
            </div>
          ) : (
            <button
              onClick={() => setShowAddEmpTypeInput(true)}
              style={{
                padding: "6px 16px",
                borderRadius: "6px",
                fontSize: "12px",
                fontWeight: 500,
                background: "#ffffff",
                color: "#374151",
                border: "1px solid #e5e7eb",
                cursor: "pointer",
              }}
            >
              + Add Type
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
