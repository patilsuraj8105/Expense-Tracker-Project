import { useState } from "react";
import { useNavigate } from "react-router";
import { Wallet, Mail, Lock, User, AlertCircle, CheckCircle } from "lucide-react";
import { API_URL } from "../imports/config";

export function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      if (isLogin) {
        // Login Flow
        const response = await fetch(`${API_URL}/auth/login`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.detail || "Invalid email or password");
        }

        // Store JWT token
        localStorage.setItem("token", data.access_token);
        
        // Fetch User profile to get name
        const profileResponse = await fetch(`${API_URL}/auth/me`, {
          headers: {
            "Authorization": `Bearer ${data.access_token}`,
          },
        });
        
        if (profileResponse.ok) {
          const profileData = await profileResponse.json();
          localStorage.setItem("user_name", profileData.full_name);
          localStorage.setItem("user_email", profileData.email);
        }

        setSuccess("Login successful! Redirecting...");
        setTimeout(() => {
          navigate("/");
        }, 1000);

      } else {
        // Register Flow
        const response = await fetch(`${API_URL}/auth/register`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            full_name: fullName,
            email: email,
            password: password,
          }),
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.detail || "Registration failed. Please check details.");
        }

        setSuccess("Account created successfully! Switching to Login...");
        setIsLogin(true);
        setPassword("");
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="flex min-h-screen w-full items-center justify-center p-4"
      style={{ background: "#0b0f1e", fontFamily: "'Inter','Segoe UI',sans-serif" }}
    >
      <div
        className="w-full max-w-md rounded-2xl p-8 shadow-2xl flex flex-col gap-6"
        style={{
          background: "#111827",
          border: "1px solid rgba(255,255,255,0.07)",
          boxShadow: "0 20px 40px -15px rgba(0, 212, 180, 0.07)",
        }}
      >
        {/* Logo */}
        <div className="flex flex-col items-center gap-2">
          <div
            className="flex items-center justify-center rounded-2xl"
            style={{
              width: 52,
              height: 52,
              background: "linear-gradient(135deg,#00d4b4,#0891b2)",
              boxShadow: "0 10px 20px -5px rgba(0, 212, 180, 0.3)",
            }}
          >
            <Wallet size={24} color="#fff" />
          </div>
          <h2 style={{ color: "#e8eaf0", fontSize: 24, fontWeight: 800, letterSpacing: "-0.5px", marginTop: 8 }}>
            Expense Tracker
          </h2>
          <p style={{ color: "#8b9ab4", fontSize: 13 }}>
            Manage expenses, track budgets & analyze alerts.
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex rounded-xl p-1 gap-1" style={{ background: "#080c18" }}>
          <button
            onClick={() => {
              setIsLogin(true);
              setError("");
              setSuccess("");
            }}
            className="flex-1 rounded-lg py-2 text-center transition-all cursor-pointer"
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: isLogin ? "#00d4b4" : "#8b9ab4",
              background: isLogin ? "rgba(0,212,180,0.08)" : "transparent",
              border: isLogin ? "1px solid rgba(0,212,180,0.15)" : "1px solid transparent",
            }}
          >
            Sign In
          </button>
          <button
            onClick={() => {
              setIsLogin(false);
              setError("");
              setSuccess("");
            }}
            className="flex-1 rounded-lg py-2 text-center transition-all cursor-pointer"
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: !isLogin ? "#00d4b4" : "#8b9ab4",
              background: !isLogin ? "rgba(0,212,180,0.08)" : "transparent",
              border: !isLogin ? "1px solid rgba(0,212,180,0.15)" : "1px solid transparent",
            }}
          >
            Register
          </button>
        </div>

        {/* Status Messages */}
        {error && (
          <div
            className="flex items-center gap-2 rounded-xl p-3"
            style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)" }}
          >
            <AlertCircle size={16} color="#ef4444" className="flex-shrink-0" />
            <span style={{ color: "#ef4444", fontSize: 12, fontWeight: 550 }}>{error}</span>
          </div>
        )}
        {success && (
          <div
            className="flex items-center gap-2 rounded-xl p-3"
            style={{ background: "rgba(0,212,180,0.1)", border: "1px solid rgba(0,212,180,0.2)" }}
          >
            <CheckCircle size={16} color="#00d4b4" className="flex-shrink-0" />
            <span style={{ color: "#00d4b4", fontSize: 12, fontWeight: 550 }}>{success}</span>
          </div>
        )}

        {/* Auth form */}
        <form onSubmit={handleAuth} className="flex flex-col gap-4">
          {!isLogin && (
            <div className="flex flex-col gap-1.5">
              <label style={{ color: "#8b9ab4", fontSize: 11, fontWeight: 600 }}>Full Name</label>
              <div
                className="flex items-center gap-2.5 px-3.5 rounded-xl transition-all"
                style={{
                  background: "#1a2035",
                  border: "1px solid rgba(255,255,255,0.07)",
                  height: 42,
                }}
              >
                <User size={15} color="#8b9ab4" />
                <input
                  required
                  type="text"
                  placeholder="John Doe"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  style={{ background: "transparent", border: "none", outline: "none", color: "#e8eaf0", fontSize: 12, width: "100%" }}
                />
              </div>
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label style={{ color: "#8b9ab4", fontSize: 11, fontWeight: 600 }}>Email Address</label>
            <div
              className="flex items-center gap-2.5 px-3.5 rounded-xl transition-all"
              style={{
                background: "#1a2035",
                border: "1px solid rgba(255,255,255,0.07)",
                height: 42,
              }}
            >
              <Mail size={15} color="#8b9ab4" />
              <input
                required
                type="email"
                placeholder="Username or Email ID"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ background: "transparent", border: "none", outline: "none", color: "#e8eaf0", fontSize: 12, width: "100%" }}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label style={{ color: "#8b9ab4", fontSize: 11, fontWeight: 600 }}>Password</label>
            <div
              className="flex items-center gap-2.5 px-3.5 rounded-xl transition-all"
              style={{
                background: "#1a2035",
                border: "1px solid rgba(255,255,255,0.07)",
                height: 42,
              }}
            >
              <Lock size={15} color="#8b9ab4" />
              <input
                required
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ background: "transparent", border: "none", outline: "none", color: "#e8eaf0", fontSize: 12, width: "100%" }}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl py-3 cursor-pointer transition-all active:scale-98 disabled:opacity-50"
            style={{
              background: "linear-gradient(135deg,#00d4b4,#0891b2)",
              color: "#fff",
              fontSize: 13,
              fontWeight: 700,
              boxShadow: "0 8px 16px -4px rgba(0, 212, 180, 0.2)",
              marginTop: 10,
            }}
          >
            {loading ? "Processing..." : isLogin ? "Sign In" : "Register Account"}
          </button>
        </form>
      </div>
    </div>
  );
}
