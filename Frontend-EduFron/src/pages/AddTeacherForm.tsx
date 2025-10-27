import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { API_BASE } from "../lib/api";

/**
 * Teacher registration form.
 *
 * Fixes / improvements applied:
 * - Fixed broken string interpolation in fetch calls (used backticks).
 * - Added response.ok checks and better error messages.
 * - Used credentials: "include" where appropriate.
 * - Added AbortController for the "me" check to avoid memory leaks.
 * - Small defensive guards and clearer localStorage handling in assessLoginResponse.
 * - Kept behavior: try auto-login after successful registration and redirect by role.
 */

const AddTeacherForm: React.FC = () => {
  const [teacher, setTeacher] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    qualification: "",
    dateOfBirth: "",
    image: "",
    subjectName: "",
    password: "",
  });

  const [message, setMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [generatedPassword, setGeneratedPassword] = useState<string>("");
  const [showSuccessDetails, setShowSuccessDetails] = useState(false);
  const navigate = useNavigate();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setTeacher((prev) => ({ ...prev, [name]: value }));
  };

  const togglePasswordVisibility = () => {
    setShowPassword((s) => !s);
  };

  const assessLoginResponse = (res: any): boolean => {
    if (!res) return false;

    try {
      if (res.sessionId) localStorage.setItem("sessionId", String(res.sessionId));
      if (res.user) localStorage.setItem("user", JSON.stringify(res.user));
      if (res.success !== undefined) localStorage.setItem("isAuthenticated", String(Boolean(res.success)));
      if (res.token) localStorage.setItem("token", String(res.token));
    } catch {
      // ignore localStorage errors
    }

    const roleRaw = res?.user?.role;
    if (!res?.success || !roleRaw) return false;
    const role = String(roleRaw).toUpperCase();

    if (role === "TEACHER" || role.includes("TEACHER")) {
      navigate("/teacher-dashboard");
      return true;
    }
    return false;
  };

  const autoLogin = async (email: string, password: string): Promise<any | null> => {
    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        // return parsed error when available
        const errText = await res.text().catch(() => "");
        console.warn("Auto-login failed:", res.status, errText);
        return null;
      }

      const result = await res.json();
      return result;
    } catch (err) {
      console.error("Auto-login error:", err);
      return null;
    }
  };

  useEffect(() => {
    const controller = new AbortController();

    const checkLoggedInAndRedirect = async () => {
      try {
        const stored = localStorage.getItem("user");
        if (stored) {
          const user = JSON.parse(stored);
          const role = (user?.role || "").toString().toUpperCase();
          if (role === "TEACHER" || role.includes("TEACHER")) {
            navigate("/teacher-dashboard");
            return;
          }
          if (role === "ADMIN" || role.includes("ADMIN")) {
            navigate("/admin-dashboard");
            return;
          }
        }

        const r = await fetch(`${API_BASE}/api/auth/me`, {
          method: "GET",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          signal: controller.signal,
        });

        if (!r.ok) return; // not logged in / no session

        const me = await r.json();
        if (me?.success && me?.user?.role) {
          try {
            localStorage.setItem("user", JSON.stringify(me.user));
            localStorage.setItem("isAuthenticated", "true");
            if (me.sessionId) localStorage.setItem("sessionId", String(me.sessionId));
            if (me.token) localStorage.setItem("token", String(me.token));
          } catch {
            /* ignore localStorage errors */
          }
          const role = String(me.user.role).toUpperCase();
          if (role === "TEACHER" || role.includes("TEACHER")) {
            navigate("/teacher-dashboard");
            return;
          }
          if (role === "ADMIN" || role.includes("ADMIN")) {
            navigate("/admin-dashboard");
            return;
          }
        }
      } catch (err) {
        if ((err as any)?.name === "AbortError") return;
        // ignore other errors
      }
    };

    checkLoggedInAndRedirect();

    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!teacher.firstName || !teacher.lastName || !teacher.email || !teacher.password) {
      setMessage("Please fill the required fields");
      return;
    }

    const payload = {
      firstName: teacher.firstName,
      lastName: teacher.lastName,
      email: teacher.email,
      phoneNumber: teacher.phoneNumber,
      qualification: teacher.qualification,
      dateOfBirth: teacher.dateOfBirth,
      image: teacher.image || "",
      subjectName: teacher.subjectName,
      password: teacher.password,
    };

    // Console log the temporary password for debugging purposes
    console.log("Teacher Registration - Temporary Password:", teacher.password);
    console.log("Teacher Registration Payload:", { ...payload, password: "[REDACTED]" });

    try {
      const response = await fetch(`${API_BASE}/api/auth/register/teacher`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include",
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        const msg = data?.message || data?.error || `Failed to register teacher (status ${response.status})`;
        throw new Error(msg);
      }

      // Try auto-login for the newly created teacher
      const loginResult = await autoLogin(payload.email, payload.password);

      if (loginResult) {
        const redirected = assessLoginResponse(loginResult);
        if (redirected) return;
      }

      // Show the success message from backend and display the temporary password
      const successMsg = data?.message || "Teacher registered successfully!";
      setGeneratedPassword(teacher.password);
      setShowSuccessDetails(true);
      setMessage(`✅ ${successMsg}`);

      setTeacher({
        firstName: "",
        lastName: "",
        email: "",
        phoneNumber: "",
        qualification: "",
        dateOfBirth: "",
        image: "",
        subjectName: "",
        password: "",
      });

      setTimeout(() => navigate("/"), 10000);
    } catch (error: any) {
      console.error("Registration error:", error);
      setMessage(`Failed to register teacher: ${error?.message || String(error)}`);
    }
  };

  return (
    <>
      <Header />

      <div className="bg-white p-6 rounded shadow-md max-w-md mx-auto my-8">
        <h2 className="text-2xl font-bold mb-4 text-center">Register Teacher</h2>
        <p className="text-sm text-gray-600 mb-4 text-center">
          Teacher number will be automatically generated
        </p>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block font-semibold mb-1">First Name:</label>
            <input
              type="text"
              name="firstName"
              value={teacher.firstName}
              onChange={handleChange}
              placeholder="First Name"
              required
              className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-emerald-500"
              style={{
                backgroundColor: 'white',
                backgroundImage: 'none',
                backgroundRepeat: 'no-repeat',
                backgroundPosition: '0 0',
                backgroundSize: 'auto',
                backgroundAttachment: 'scroll'
              }}
            />
          </div>

          <div>
            <label className="block font-semibold mb-1">Last Name:</label>
            <input
              type="text"
              name="lastName"
              value={teacher.lastName}
              onChange={handleChange}
              placeholder="Last Name"
              required
              className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-emerald-500"
              style={{
                backgroundColor: 'white',
                backgroundImage: 'none',
                backgroundRepeat: 'no-repeat',
                backgroundPosition: '0 0',
                backgroundSize: 'auto',
                backgroundAttachment: 'scroll'
              }}
            />
          </div>

          <div>
            <label className="block font-semibold mb-1">Email:</label>
            <input
              type="email"
              name="email"
              value={teacher.email}
              onChange={handleChange}
              placeholder="Email"
              required
              className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-emerald-500"
              style={{
                backgroundColor: 'white',
                backgroundImage: 'none',
                backgroundRepeat: 'no-repeat',
                backgroundPosition: '0 0',
                backgroundSize: 'auto',
                backgroundAttachment: 'scroll'
              }}
            />
          </div>

          <div>
            <label className="block font-semibold mb-1">Phone Number:</label>
            <input
              type="tel"
              name="phoneNumber"
              value={teacher.phoneNumber}
              onChange={handleChange}
              placeholder="Phone Number"
              className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-emerald-500"
              style={{
                backgroundColor: 'white',
                backgroundImage: 'none',
                backgroundRepeat: 'no-repeat',
                backgroundPosition: '0 0',
                backgroundSize: 'auto',
                backgroundAttachment: 'scroll'
              }}
            />
          </div>

          <div>
            <label className="block font-semibold mb-1">Qualification:</label>
            <input
              type="text"
              name="qualification"
              value={teacher.qualification}
              onChange={handleChange}
              placeholder="Qualification"
              className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-emerald-500"
              style={{
                backgroundColor: 'white',
                backgroundImage: 'none',
                backgroundRepeat: 'no-repeat',
                backgroundPosition: '0 0',
                backgroundSize: 'auto',
                backgroundAttachment: 'scroll'
              }}
            />
          </div>

          <div>
            <label className="block font-semibold mb-1">Date of Birth:</label>
            <input
              type="date"
              name="dateOfBirth"
              value={teacher.dateOfBirth}
              onChange={handleChange}
              className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-emerald-500"
              style={{
                backgroundColor: 'white',
                backgroundImage: 'none',
                backgroundRepeat: 'no-repeat',
                backgroundPosition: '0 0',
                backgroundSize: 'auto',
                backgroundAttachment: 'scroll'
              }}
            />
          </div>

          <div>
            <label className="block font-semibold mb-1">Image URL (Optional):</label>
            <input
              type="text"
              name="image"
              value={teacher.image}
              onChange={handleChange}
              placeholder="Image URL"
              className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-emerald-500"
              style={{
                backgroundColor: 'white',
                backgroundImage: 'none',
                backgroundRepeat: 'no-repeat',
                backgroundPosition: '0 0',
                backgroundSize: 'auto',
                backgroundAttachment: 'scroll'
              }}
            />
          </div>

          <div>
            <label className="block font-semibold mb-1">Subject Name:</label>
            <select
              name="subjectName"
              value={teacher.subjectName}
              onChange={handleChange}
              className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-emerald-500"
              style={{
                backgroundColor: 'white',
                backgroundImage: 'none',
                backgroundRepeat: 'no-repeat',
                backgroundPosition: '0 0',
                backgroundSize: 'auto',
                backgroundAttachment: 'scroll'
              }}
            >
              <option value="">-- Choose Subject --</option>
              <option value="Mathematics">Mathematics</option>
              <option value="Science">Science</option>
              <option value="English">English</option>
              <option value="ICT">ICT</option>
              <option value="Business and Accounting">Business and Accounting</option>
              <option value="Tamil">Tamil</option>
              <option value="Dancing">Dancing</option>
              <option value="Drama">Drama</option>
              <option value="Maths(English)">Maths(English)</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold mb-1">Password:</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={teacher.password}
                onChange={handleChange}
                placeholder="Password"
                required
                minLength={8}
                className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-emerald-500 pr-10"
                style={{
                  backgroundColor: 'white',
                  backgroundImage: 'none',
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: '0 0',
                  backgroundSize: 'auto',
                  backgroundAttachment: 'scroll'
                }}
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-600 hover:text-gray-800"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L6.59 6.59m9.02 9.02l3.83 3.83" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Password must be at least 8 characters long
            </p>
          </div>

          <button
            type="submit"
            className="w-full bg-emerald-500 text-white p-2 rounded hover:bg-emerald-600 transition duration-200 font-semibold"
          >
            Register Teacher
          </button>
        </form>

        {message && (
          <div
            className={`mt-4 p-3 rounded text-left ${
              message.startsWith("✅")
                ? "bg-emerald-100 text-emerald-700 border border-emerald-300"
                : "bg-red-100 text-red-700 border border-red-300"
            }`}
            role="status"
          >
            <div className="whitespace-pre-line">{message}</div>
            
            {/* Temporary Password Display */}
            {showSuccessDetails && generatedPassword && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-semibold text-yellow-800">📋 Temporary Password:</span>
                </div>
                <div className="bg-white p-2 rounded border font-mono text-lg tracking-wider text-center border-dashed border-yellow-300">
                  {generatedPassword}
                </div>
                <p className="text-xs text-yellow-700 mt-2">
                  ⚠️ Please save this password! The teacher will need it to log in.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      <Footer />
    </>
  );
};

export default AddTeacherForm;