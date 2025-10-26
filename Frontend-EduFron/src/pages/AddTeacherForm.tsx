import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";

/**
 * Teacher registration form.
 * Behaviour added:
 * - On mount: if a logged in user exists (localStorage.user or /api/auth/me),
 *   redirect immediately to the correct dashboard:
 *     - TEACHER -> /teacher-dashboard
 *     - ADMIN   -> /admin-dashboard
 *
 * - After successful registration, attempt auto-login with the created credentials.
 *   If the login response indicates role TEACHER (or role includes TEACHER),
 *   redirect to /teacher-dashboard immediately.
 *
 * Notes:
 * - Uses credentials: 'include' for cookie/session-based auth where appropriate.
 * - Persists minimal session info (sessionId, user, isAuthenticated) to localStorage when returned.
 * - Adjust dashboard routes if your app uses different paths.
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
  const navigate = useNavigate(); // React Router navigation hook

  // Handle input changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setTeacher((prev) => ({ ...prev, [name]: value }));
  };

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Inspect a login-style response and redirect based on role.
  const assessLoginResponse = (res: any): boolean => {
    if (!res) return false;

    try {
      if (res.sessionId) localStorage.setItem("sessionId", String(res.sessionId));
      if (res.user) localStorage.setItem("user", JSON.stringify(res.user));
      if (res.success !== undefined) localStorage.setItem("isAuthenticated", String(Boolean(res.success)));
    } catch {
      /* ignore localStorage errors */
    }

    const roleRaw = res?.user?.role;
    if (!res?.success || !roleRaw) return false;
    const role = String(roleRaw).toUpperCase();

    if (role === "TEACHER" || role.includes("TEACHER")) {
      navigate("/teacher-dashboard");
      return true;
    }
    if (role === "ADMIN" || role.includes("ADMIN")) {
      navigate("/admin-dashboard");
      return true;
    }
    return false;
  };

  // Attempt to auto-login after registration (returns parsed response or null)
  const autoLogin = async (email: string, password: string): Promise<any | null> => {
    try {
      const res = await fetch("VITE_BACKEND_URL/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      const result = await res.json();
      return result;
    } catch (err) {
      console.error("Auto-login error:", err);
      return null;
    }
  };

  // On mount: if current user is already logged-in, redirect (teacher/admin)
  useEffect(() => {
    const checkLoggedInAndRedirect = async () => {
      try {
        // 1) Check localStorage.user first
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

        // 2) Fallback: call /me to verify server session (useful for cookie-based auth)
        const r = await fetch("VITE_BACKEND_URL/api/auth/me", {
          method: "GET",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        });

        if (r.ok) {
          const me = await r.json();
          if (me?.success && me?.user?.role) {
            const role = String(me.user.role).toUpperCase();
            try {
              localStorage.setItem("user", JSON.stringify(me.user));
              localStorage.setItem("isAuthenticated", "true");
              if (me.sessionId) localStorage.setItem("sessionId", String(me.sessionId));
            } catch {}
            if (role === "TEACHER" || role.includes("TEACHER")) {
              navigate("/teacher-dashboard");
              return;
            }
            if (role === "ADMIN" || role.includes("ADMIN")) {
              navigate("/admin-dashboard");
              return;
            }
          }
        }
      } catch (err) {
        // ignore errors; user is likely not logged in
      }
    };

    checkLoggedInAndRedirect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

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

    try {
      const response = await fetch(
        "VITE_BACKEND_URL/api/auth/register/teacher",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
          credentials: "include", // include cookies if your auth returns them
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to register teacher");
      }

      // Try auto-login for the newly created teacher
      const loginResult = await autoLogin(payload.email, payload.password);

      if (loginResult) {
        // If login response indicates TEACHER (or ADMIN) redirect immediately
        const redirected = assessLoginResponse(loginResult);
        if (redirected) {
          // already redirected
          return;
        }
      }

      // Fallback (if auto-login not available or not redirecting)
      setMessage(`✅ Teacher registered successfully! Redirecting...`);

      // Clear form
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

      // Redirect to homepage as a fallback after 2 seconds
      setTimeout(() => {
        navigate("/");
      }, 2000);
    } catch (error: any) {
      console.error(error);
      setMessage(` Failed to register teacher: ${error?.message || String(error)}`);
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
          {/* First Name */}
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
            />
          </div>

          {/* Last Name */}
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
            />
          </div>

          {/* Email */}
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
            />
          </div>

          {/* Phone Number */}
          <div>
            <label className="block font-semibold mb-1">Phone Number:</label>
            <input
              type="tel"
              name="phoneNumber"
              value={teacher.phoneNumber}
              onChange={handleChange}
              placeholder="Phone Number"
              required
              className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Qualification */}
          <div>
            <label className="block font-semibold mb-1">Qualification:</label>
            <input
              type="text"
              name="qualification"
              value={teacher.qualification}
              onChange={handleChange}
              placeholder="Qualification"
              required
              className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Date of Birth */}
          <div>
            <label className="block font-semibold mb-1">Date of Birth:</label>
            <input
              type="date"
              name="dateOfBirth"
              value={teacher.dateOfBirth}
              onChange={handleChange}
              required
              className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Image URL (Optional) */}
          <div>
            <label className="block font-semibold mb-1">Image URL (Optional):</label>
            <input
              type="text"
              name="image"
              value={teacher.image}
              onChange={handleChange}
              placeholder="Image URL"
              className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Subject Name */}
          <div>
            <label className="block font-semibold mb-1">Subject Name:</label>
            <select
              name="subjectName"
              value={teacher.subjectName}
              onChange={handleChange}
              required
              className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="">-- Choose Subject --</option>
              <option value="Mathematics">Mathematics</option>
              <option value="Science">Science</option>
              <option value="English">English</option>
              <option value="ICT">ICT</option>
              <option value="History">Business and Accounting</option>
              <option value="Geography">Tamil</option>
              <option value="Physics">Dancing</option>
              <option value="Chemistry">Drama</option>
              <option value="Biology">Maths(English)</option>
            </select>
          </div>

          {/* Password with visibility toggle */}
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
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-600 hover:text-gray-800"
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

          {/* Submit button */}
          <button
            type="submit"
            className="w-full bg-emerald-500 text-white p-2 rounded hover:bg-emerald-600 transition duration-200 font-semibold"
          >
            Register Teacher
          </button>
        </form>

        {message && (
          <div
            className={`mt-4 p-3 rounded text-center ${
              message.startsWith("✅")
                ? "bg-emerald-100 text-emerald-700 border border-emerald-300"
                : "bg-red-100 text-red-700 border border-red-300"
            }`}
          >
            {message}
          </div>
        )}
      </div>

      <Footer />
    </>
  );
};

export default AddTeacherForm;