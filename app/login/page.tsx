"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  validateMobile,
  validateEmail,
  validatePassword,
  validateConfirmPassword,
  validateRequired,
} from "../lib/validation";
import { apiPost } from "../lib/api";

type View = "login" | "register" | "forgot" | "otp" | "reset";

export default function LoginPage() {
  const router = useRouter();
  const [view, setView] = useState<View>("login");

  // Login state
  const [loginPhone, setLoginPhone] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Register state
  const [regName, setRegName] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirm, setRegConfirm] = useState("");

  // Forgot / OTP / Reset state
  const [forgotEmail, setForgotEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  // Shared state
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [apiError, setApiError] = useState("");

  // ===== VALIDATION =====
  const validateLogin = () => {
    const e: Record<string, string> = {};
    const phoneErr = validateMobile(loginPhone);
    if (phoneErr) e.phone = phoneErr;
    const pwdErr = validatePassword(loginPassword);
    if (pwdErr) e.password = pwdErr;
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateRegister = () => {
    const e: Record<string, string> = {};
    const nameErr = validateRequired(regName, "Name");
    if (nameErr) e.name = nameErr;
    const phoneErr = validateMobile(regPhone);
    if (phoneErr) e.phone = phoneErr;
    const emailErr = validateEmail(regEmail);
    if (emailErr) e.email = emailErr;
    const pwdErr = validatePassword(regPassword);
    if (pwdErr) e.password = pwdErr;
    const confirmErr = validateConfirmPassword(regPassword, regConfirm);
    if (confirmErr) e.confirm = confirmErr;
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateForgot = () => {
    const e: Record<string, string> = {};
    const emailErr = validateEmail(forgotEmail);
    if (emailErr) e.email = emailErr;
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateOtp = () => {
    const e: Record<string, string> = {};
    if (otp.some((d) => !d)) e.otp = "Enter all 6 digits";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateReset = () => {
    const e: Record<string, string> = {};
    if (!newPassword.trim()) e.password = "Password is required";
    else if (newPassword.length < 6) e.password = "Minimum 6 characters";
    if (newPassword !== confirmNewPassword)
      e.confirm = "Passwords don't match";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ===== API CALLS =====

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateLogin()) return;
    setIsLoading(true);
    setApiError("");
    try {
      const res = await apiPost<any>("/auth/login", { phone: loginPhone, password: loginPassword });
      // Store token
      localStorage.setItem("token", res.access_token || res.token || "");
      router.push("/admin/dashboard");
    } catch (err: unknown) {
      setApiError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateRegister()) return;
    setIsLoading(true);
    setApiError("");
    try {
      const res = await apiPost<any>("/auth/first-admin", {
        name: regName,
        phone: regPhone,
        email: regEmail,
        password: regPassword,
      });
      // Auto switch to login
      setView("login");
      setLoginPhone(regPhone);
      setApiError("");
    } catch (err: unknown) {
      setApiError(
        err instanceof Error ? err.message : "Registration failed"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForgot()) return;
    setIsLoading(true);
    setApiError("");
    try {
      const res = await apiPost<any>("/auth/forgot-password", { email: forgotEmail });
      setView("otp");
    } catch (err: unknown) {
      setApiError(
        err instanceof Error ? err.message : "Failed to send OTP"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateOtp()) return;
    setIsLoading(true);
    setApiError("");
    try {
      const res = await apiPost<any>("/auth/verify-otp", {
        email: forgotEmail,
        otp: otp.join(""),
      });
      setView("reset");
    } catch (err: unknown) {
      setApiError(err instanceof Error ? err.message : "Invalid OTP");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateReset()) return;
    setIsLoading(true);
    setApiError("");
    try {
      const res = await apiPost<any>("/auth/reset-password", {
        email: forgotEmail,
        otp: otp.join(""),
        newPassword,
      });
      setView("login");
      setApiError("");
    } catch (err: unknown) {
      setApiError(
        err instanceof Error ? err.message : "Failed to reset password"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const switchView = (v: View) => {
    setView(v);
    setErrors({});
    setApiError("");
  };

  // ===== OTP INPUT HANDLER =====
  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    if (value && index < 5) {
      const next = document.getElementById(`otp-${index + 1}`);
      next?.focus();
    }
  };

  const handleOtpKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      const prev = document.getElementById(`otp-${index - 1}`);
      prev?.focus();
    }
  };

  // ===== SHARED STYLES =====
  const inputStyle = (hasError: boolean): React.CSSProperties => ({
    width: "100%",
    padding: "12px 16px",
    borderRadius: "8px",
    border: `1.5px solid ${hasError ? "#ef4444" : "#e5e7eb"}`,
    fontSize: "14px",
    outline: "none",
    transition: "border-color 0.2s ease, box-shadow 0.2s ease",
    background: hasError ? "#fef2f2" : "#fafafa",
    fontFamily: "'Inter', sans-serif",
  });

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: "12px",
    fontWeight: 600,
    color: "#374151",
    marginBottom: "6px",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  };

  const errorStyle: React.CSSProperties = {
    fontSize: "12px",
    color: "#ef4444",
    margin: "6px 0 0 0",
  };

  const handleFocus = (
    e: React.FocusEvent<HTMLInputElement>,
    hasError: boolean
  ) => {
    if (!hasError) {
      e.target.style.borderColor = "#2d6a4f";
      e.target.style.boxShadow = "0 0 0 3px rgba(45,106,79,0.1)";
      e.target.style.background = "#ffffff";
    }
  };

  const handleBlur = (
    e: React.FocusEvent<HTMLInputElement>,
    hasError: boolean
  ) => {
    if (!hasError) {
      e.target.style.borderColor = "#e5e7eb";
      e.target.style.boxShadow = "none";
      e.target.style.background = "#fafafa";
    }
  };

  // ===== VIEW CONFIGS =====
  const viewConfig: Record<
    View,
    { title: string; subtitle: string; emoji: string }
  > = {
    login: {
      title: "Welcome back",
      subtitle: "Sign in to your admin account",
      emoji: "👋",
    },
    register: {
      title: "Create Admin",
      subtitle: "Set up the first admin account",
      emoji: "🚀",
    },
    forgot: {
      title: "Forgot Password",
      subtitle: "Enter your email to receive an OTP",
      emoji: "🔑",
    },
    otp: {
      title: "Verify OTP",
      subtitle: `OTP sent to ${forgotEmail}`,
      emoji: "📱",
    },
    reset: {
      title: "Reset Password",
      subtitle: "Set your new password",
      emoji: "🔒",
    },
  };

  const config = viewConfig[view];

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        background:
          "linear-gradient(135deg, #1b4332 0%, #2d6a4f 40%, #40916c 100%)",
        fontFamily: "'Inter', sans-serif",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Decorative circles */}
      <div
        style={{
          position: "absolute",
          top: "-120px",
          right: "-120px",
          width: "400px",
          height: "400px",
          borderRadius: "50%",
          background: "rgba(255,255,255,0.04)",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "-80px",
          left: "-80px",
          width: "300px",
          height: "300px",
          borderRadius: "50%",
          background: "rgba(255,255,255,0.03)",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: "40%",
          left: "15%",
          width: "200px",
          height: "200px",
          borderRadius: "50%",
          background: "rgba(255,255,255,0.02)",
        }}
      />

      {/* Left Side — Branding */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "60px 80px",
          color: "#ffffff",
          position: "relative",
          zIndex: 1,
        }}
      >
        <div style={{ marginBottom: "48px" }}>
          <div
            style={{
              fontSize: "32px",
              fontWeight: 800,
              letterSpacing: "-0.5px",
              marginBottom: "8px",
            }}
          >
            LocalHire
          </div>
          <div
            style={{
              fontSize: "13px",
              fontWeight: 500,
              opacity: 0.6,
              letterSpacing: "1px",
              textTransform: "uppercase",
            }}
          >
            Admin Console v1.0
          </div>
        </div>

        <h1
          style={{
            fontSize: "42px",
            fontWeight: 700,
            lineHeight: 1.2,
            marginBottom: "20px",
            maxWidth: "420px",
          }}
        >
          Manage your local
          <br />
          hiring platform
        </h1>
        <p
          style={{
            fontSize: "16px",
            opacity: 0.7,
            lineHeight: 1.7,
            maxWidth: "380px",
          }}
        >
          Monitor workers, employers, job posts, and analytics — all from one
          powerful admin dashboard.
        </p>

        <div style={{ display: "flex", gap: "40px", marginTop: "48px" }}>
          {[
            { value: "12.4K", label: "Workers" },
            { value: "3.2K", label: "Employers" },
            { value: "847", label: "Active Jobs" },
          ].map((stat) => (
            <div key={stat.label}>
              <div style={{ fontSize: "28px", fontWeight: 700 }}>
                {stat.value}
              </div>
              <div
                style={{
                  fontSize: "12px",
                  opacity: 0.5,
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                  marginTop: "4px",
                }}
              >
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Side — Auth Card */}
      <div
        style={{
          width: "500px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "40px",
          position: "relative",
          zIndex: 1,
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: "420px",
            background: "#ffffff",
            borderRadius: "16px",
            padding: "40px 36px",
            boxShadow: "0 25px 60px rgba(0,0,0,0.3)",
          }}
        >
          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: "28px" }}>
            <div style={{ fontSize: "28px", marginBottom: "8px" }}>
              {config.emoji}
            </div>
            <h2
              style={{
                fontSize: "22px",
                fontWeight: 700,
                color: "#1a1a1a",
                margin: "0 0 6px 0",
              }}
            >
              {config.title}
            </h2>
            <p style={{ fontSize: "13px", color: "#6b7280", margin: 0 }}>
              {config.subtitle}
            </p>
          </div>

          {/* API Error */}
          {apiError && (
            <div
              style={{
                background: "#fef2f2",
                border: "1px solid #fecaca",
                borderRadius: "8px",
                padding: "10px 14px",
                marginBottom: "20px",
                fontSize: "13px",
                color: "#dc2626",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <span>⚠️</span> {apiError}
            </div>
          )}

          {/* ===== LOGIN VIEW ===== */}
          {view === "login" && (
            <form onSubmit={handleLogin}>
              <div style={{ marginBottom: "18px" }}>
                <label style={labelStyle}>Phone Number</label>
                <input
                  id="login-phone"
                  type="tel"
                  value={loginPhone}
                  onChange={(e) => {
                    setLoginPhone(e.target.value);
                    if (errors.phone)
                      setErrors({ ...errors, phone: "" });
                  }}
                  placeholder="+1234567890"
                  style={inputStyle(!!errors.phone)}
                  onFocus={(e) => handleFocus(e, !!errors.phone)}
                  onBlur={(e) => handleBlur(e, !!errors.phone)}
                />
                {errors.phone && <p style={errorStyle}>{errors.phone}</p>}
              </div>

              <div style={{ marginBottom: "20px" }}>
                <label style={labelStyle}>Password</label>
                <div style={{ position: "relative" }}>
                  <input
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    value={loginPassword}
                    onChange={(e) => {
                      setLoginPassword(e.target.value);
                      if (errors.password)
                        setErrors({ ...errors, password: "" });
                    }}
                    placeholder="Enter your password"
                    style={{
                      ...inputStyle(!!errors.password),
                      paddingRight: "44px",
                    }}
                    onFocus={(e) => handleFocus(e, !!errors.password)}
                    onBlur={(e) => handleBlur(e, !!errors.password)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: "absolute",
                      right: "12px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      fontSize: "14px",
                      color: "#9ca3af",
                      padding: "4px",
                    }}
                  >
                    {showPassword ? "🙈" : "👁️"}
                  </button>
                </div>
                {errors.password && (
                  <p style={errorStyle}>{errors.password}</p>
                )}
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "24px",
                }}
              >
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    fontSize: "13px",
                    color: "#6b7280",
                    cursor: "pointer",
                  }}
                >
                  <input
                    type="checkbox"
                    style={{
                      width: "15px",
                      height: "15px",
                      accentColor: "#2d6a4f",
                      cursor: "pointer",
                    }}
                  />
                  Remember me
                </label>
                <button
                  type="button"
                  onClick={() => switchView("forgot")}
                  style={{
                    fontSize: "13px",
                    color: "#2d6a4f",
                    fontWeight: 500,
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    textDecoration: "none",
                    padding: 0,
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.textDecoration = "underline")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.textDecoration = "none")
                  }
                >
                  Forgot password?
                </button>
              </div>

              <SubmitButton label="Sign In" isLoading={isLoading} />

              <p
                style={{
                  textAlign: "center",
                  fontSize: "13px",
                  color: "#6b7280",
                  marginTop: "24px",
                  marginBottom: 0,
                }}
              >
                First time setup?{" "}
                <button
                  type="button"
                  onClick={() => switchView("register")}
                  style={{
                    color: "#2d6a4f",
                    fontWeight: 600,
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontSize: "13px",
                    padding: 0,
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.textDecoration = "underline")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.textDecoration = "none")
                  }
                >
                  Create Admin
                </button>
              </p>
            </form>
          )}

          {/* ===== REGISTER VIEW ===== */}
          {view === "register" && (
            <form onSubmit={handleRegister}>
              <div style={{ marginBottom: "16px" }}>
                <label style={labelStyle}>Full Name</label>
                <input
                  type="text"
                  value={regName}
                  onChange={(e) => {
                    setRegName(e.target.value);
                    if (errors.name)
                      setErrors({ ...errors, name: "" });
                  }}
                  placeholder="Your full name"
                  style={inputStyle(!!errors.name)}
                  onFocus={(e) => handleFocus(e, !!errors.name)}
                  onBlur={(e) => handleBlur(e, !!errors.name)}
                />
                {errors.name && <p style={errorStyle}>{errors.name}</p>}
              </div>

              <div style={{ marginBottom: "16px" }}>
                <label style={labelStyle}>Phone Number</label>
                <input
                  type="tel"
                  value={regPhone}
                  onChange={(e) => {
                    setRegPhone(e.target.value);
                    if (errors.phone)
                      setErrors({ ...errors, phone: "" });
                  }}
                  placeholder="+1234567890"
                  style={inputStyle(!!errors.phone)}
                  onFocus={(e) => handleFocus(e, !!errors.phone)}
                  onBlur={(e) => handleBlur(e, !!errors.phone)}
                />
                {errors.phone && <p style={errorStyle}>{errors.phone}</p>}
              </div>

              <div style={{ marginBottom: "16px" }}>
                <label style={labelStyle}>Email Address</label>
                <input
                  type="email"
                  value={regEmail}
                  onChange={(e) => {
                    setRegEmail(e.target.value);
                    if (errors.email)
                      setErrors({ ...errors, email: "" });
                  }}
                  placeholder="admin@local.com"
                  style={inputStyle(!!errors.email)}
                  onFocus={(e) => handleFocus(e, !!errors.email)}
                  onBlur={(e) => handleBlur(e, !!errors.email)}
                />
                {errors.email && <p style={errorStyle}>{errors.email}</p>}
              </div>

              <div style={{ marginBottom: "16px" }}>
                <label style={labelStyle}>Password</label>
                <input
                  type="password"
                  value={regPassword}
                  onChange={(e) => {
                    setRegPassword(e.target.value);
                    if (errors.password)
                      setErrors({ ...errors, password: "" });
                  }}
                  placeholder="Min 6 characters"
                  style={inputStyle(!!errors.password)}
                  onFocus={(e) => handleFocus(e, !!errors.password)}
                  onBlur={(e) => handleBlur(e, !!errors.password)}
                />
                {errors.password && (
                  <p style={errorStyle}>{errors.password}</p>
                )}
              </div>

              <div style={{ marginBottom: "24px" }}>
                <label style={labelStyle}>Confirm Password</label>
                <input
                  type="password"
                  value={regConfirm}
                  onChange={(e) => {
                    setRegConfirm(e.target.value);
                    if (errors.confirm)
                      setErrors({ ...errors, confirm: "" });
                  }}
                  placeholder="Re-enter password"
                  style={inputStyle(!!errors.confirm)}
                  onFocus={(e) => handleFocus(e, !!errors.confirm)}
                  onBlur={(e) => handleBlur(e, !!errors.confirm)}
                />
                {errors.confirm && (
                  <p style={errorStyle}>{errors.confirm}</p>
                )}
              </div>

              <SubmitButton label="Create Admin Account" isLoading={isLoading} />

              <p
                style={{
                  textAlign: "center",
                  fontSize: "13px",
                  color: "#6b7280",
                  marginTop: "24px",
                  marginBottom: 0,
                }}
              >
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => switchView("login")}
                  style={{
                    color: "#2d6a4f",
                    fontWeight: 600,
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontSize: "13px",
                    padding: 0,
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.textDecoration = "underline")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.textDecoration = "none")
                  }
                >
                  Sign In
                </button>
              </p>
            </form>
          )}

          {/* ===== FORGOT PASSWORD VIEW ===== */}
          {view === "forgot" && (
            <form onSubmit={handleForgotPassword}>
              <div style={{ marginBottom: "24px" }}>
                <label style={labelStyle}>Email Address</label>
                <input
                  type="email"
                  value={forgotEmail}
                  onChange={(e) => {
                    setForgotEmail(e.target.value);
                    if (errors.email)
                      setErrors({ ...errors, email: "" });
                  }}
                  placeholder="admin@local.com"
                  style={inputStyle(!!errors.email)}
                  onFocus={(e) => handleFocus(e, !!errors.email)}
                  onBlur={(e) => handleBlur(e, !!errors.email)}
                />
                {errors.email && <p style={errorStyle}>{errors.email}</p>}
              </div>

              <SubmitButton label="Send OTP" isLoading={isLoading} />

              <p
                style={{
                  textAlign: "center",
                  fontSize: "13px",
                  color: "#6b7280",
                  marginTop: "24px",
                  marginBottom: 0,
                }}
              >
                Remember your password?{" "}
                <button
                  type="button"
                  onClick={() => switchView("login")}
                  style={{
                    color: "#2d6a4f",
                    fontWeight: 600,
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontSize: "13px",
                    padding: 0,
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.textDecoration = "underline")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.textDecoration = "none")
                  }
                >
                  Sign In
                </button>
              </p>
            </form>
          )}

          {/* ===== OTP VIEW ===== */}
          {view === "otp" && (
            <form onSubmit={handleVerifyOtp}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  gap: "10px",
                  marginBottom: "24px",
                }}
              >
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    id={`otp-${i}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(i, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(i, e)}
                    style={{
                      width: "48px",
                      height: "52px",
                      textAlign: "center",
                      fontSize: "20px",
                      fontWeight: 700,
                      borderRadius: "10px",
                      border: `1.5px solid ${errors.otp ? "#ef4444" : digit ? "#2d6a4f" : "#e5e7eb"
                        }`,
                      outline: "none",
                      background: digit ? "#f0fdf4" : "#fafafa",
                      color: "#1a1a1a",
                      transition: "all 0.2s ease",
                      fontFamily: "'Inter', sans-serif",
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = "#2d6a4f";
                      e.target.style.boxShadow =
                        "0 0 0 3px rgba(45,106,79,0.1)";
                    }}
                    onBlur={(e) => {
                      if (!digit) {
                        e.target.style.borderColor = "#e5e7eb";
                      }
                      e.target.style.boxShadow = "none";
                    }}
                  />
                ))}
              </div>
              {errors.otp && (
                <p style={{ ...errorStyle, textAlign: "center", marginBottom: "16px" }}>
                  {errors.otp}
                </p>
              )}

              <SubmitButton label="Verify OTP" isLoading={isLoading} />

              <p
                style={{
                  textAlign: "center",
                  fontSize: "13px",
                  color: "#6b7280",
                  marginTop: "20px",
                  marginBottom: 0,
                }}
              >
                Didn&apos;t receive it?{" "}
                <button
                  type="button"
                  onClick={() => switchView("forgot")}
                  style={{
                    color: "#2d6a4f",
                    fontWeight: 600,
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontSize: "13px",
                    padding: 0,
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.textDecoration = "underline")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.textDecoration = "none")
                  }
                >
                  Resend
                </button>
              </p>
            </form>
          )}

          {/* ===== RESET PASSWORD VIEW ===== */}
          {view === "reset" && (
            <form onSubmit={handleResetPassword}>
              <div style={{ marginBottom: "16px" }}>
                <label style={labelStyle}>New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    if (errors.password)
                      setErrors({ ...errors, password: "" });
                  }}
                  placeholder="Min 6 characters"
                  style={inputStyle(!!errors.password)}
                  onFocus={(e) => handleFocus(e, !!errors.password)}
                  onBlur={(e) => handleBlur(e, !!errors.password)}
                />
                {errors.password && (
                  <p style={errorStyle}>{errors.password}</p>
                )}
              </div>

              <div style={{ marginBottom: "24px" }}>
                <label style={labelStyle}>Confirm New Password</label>
                <input
                  type="password"
                  value={confirmNewPassword}
                  onChange={(e) => {
                    setConfirmNewPassword(e.target.value);
                    if (errors.confirm)
                      setErrors({ ...errors, confirm: "" });
                  }}
                  placeholder="Re-enter new password"
                  style={inputStyle(!!errors.confirm)}
                  onFocus={(e) => handleFocus(e, !!errors.confirm)}
                  onBlur={(e) => handleBlur(e, !!errors.confirm)}
                />
                {errors.confirm && (
                  <p style={errorStyle}>{errors.confirm}</p>
                )}
              </div>

              <SubmitButton
                label="Reset Password"
                isLoading={isLoading}
              />
            </form>
          )}

          {/* Footer */}
          <p
            style={{
              textAlign: "center",
              fontSize: "11px",
              color: "#d1d5db",
              marginTop: "24px",
              marginBottom: 0,
            }}
          >
            Protected by Local security
          </p>
        </div>
      </div>

      {/* Spinner animation */}
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

// ===== SUBMIT BUTTON COMPONENT =====
function SubmitButton({
  label,
  isLoading,
}: {
  label: string;
  isLoading: boolean;
}) {
  return (
    <button
      type="submit"
      disabled={isLoading}
      style={{
        width: "100%",
        padding: "13px",
        borderRadius: "8px",
        fontSize: "14px",
        fontWeight: 600,
        color: "#ffffff",
        background: isLoading
          ? "#6b7280"
          : "linear-gradient(135deg, #1b4332, #2d6a4f)",
        border: "none",
        cursor: isLoading ? "not-allowed" : "pointer",
        transition: "all 0.2s ease",
        boxShadow: "0 4px 12px rgba(45,106,79,0.3)",
        letterSpacing: "0.3px",
        fontFamily: "'Inter', sans-serif",
      }}
      onMouseEnter={(e) => {
        if (!isLoading) {
          e.currentTarget.style.boxShadow =
            "0 6px 20px rgba(45,106,79,0.45)";
          e.currentTarget.style.transform = "translateY(-1px)";
        }
      }}
      onMouseLeave={(e) => {
        if (!isLoading) {
          e.currentTarget.style.boxShadow =
            "0 4px 12px rgba(45,106,79,0.3)";
          e.currentTarget.style.transform = "translateY(0)";
        }
      }}
    >
      {isLoading ? (
        <span
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
          }}
        >
          <span
            style={{
              width: "16px",
              height: "16px",
              border: "2px solid rgba(255,255,255,0.3)",
              borderTopColor: "#ffffff",
              borderRadius: "50%",
              display: "inline-block",
              animation: "spin 0.8s linear infinite",
            }}
          />
          Processing...
        </span>
      ) : (
        label
      )}
    </button>
  );
}
