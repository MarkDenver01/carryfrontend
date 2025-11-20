import React, { useState, useEffect } from "react";
import type { FormEvent } from "react";
import { Button } from "flowbite-react";
import { useNavigate } from "react-router-dom";
import ReCAPTCHA from "react-google-recaptcha";
import { login } from "../../libs/ApiGatewayDatasource.ts";
import { useAuth } from "../../context/AuthContext.tsx";
import Swal from "sweetalert2";
import { getSwalTheme } from "../../utils/getSwalTheme";
import type { LoginResponse } from "../../libs/models/login";
import {
  HiLockClosed,
  HiUser,
  HiEye,
  HiEyeOff,
  HiShoppingCart,
  HiTag,
  HiCube,
} from "react-icons/hi";
import { motion } from "framer-motion";

const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [recaptchaValue, setRecaptchaValue] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [capsLockOn, setCapsLockOn] = useState(false);
  const [clock, setClock] = useState({ time: "", date: "" });
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [tipIndex, setTipIndex] = useState(0);

  const navigate = useNavigate();
  const { setAuth } = useAuth();

  // 🔧 Config (UI only)
  const maintenanceMode = true; // set to false pag wala maintenance
  const tips = [
    "Tip: Make sure Caps Lock is off before typing your password.",
    "Tip: Never share your admin credentials with other users.",
    "Tip: Log out when using a shared or public terminal.",
    "Tip: Use a strong password with letters, numbers, and symbols.",
  ];

  const systemStatus = [
    { label: "API Server", status: "Online", color: "bg-emerald-500" },
    { label: "Database", status: "Connected", color: "bg-emerald-400" },
    { label: "SMS Gateway", status: "Active", color: "bg-emerald-500" },
  ];

  // ⏰ POS-style digital clock
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      const time = now.toLocaleTimeString("en-PH", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
      const date = now.toLocaleDateString("en-PH", {
        weekday: "short",
        month: "short",
        day: "2-digit",
        year: "numeric",
      });
      setClock({ time, date });
    };

    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  // 💡 Tips rotator
  useEffect(() => {
    const interval = setInterval(() => {
      setTipIndex((prev) => (prev + 1) % tips.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [tips.length]);

  // 📌 ORIGINAL LOGIN LOGIC (unchanged)
  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();

    if (!recaptchaValue) {
      Swal.fire({
        icon: "error",
        title: "Invalid Captcha",
        text: "Please complete the captcha.",
        ...getSwalTheme(),
      });
      return;
    }

    try {
      setLoading(true);
      const response: LoginResponse = await login({ email, password });
      setAuth(response);

      if (response.role !== "ADMIN") {
        Swal.fire({
          icon: "error",
          title: "Access Denied",
          text: "Non-admin roles cannot log in.",
          ...getSwalTheme(),
        });
        return;
      }

      Swal.fire({
        icon: "success",
        title: `Hi ${response.username}!`,
        text: "Login successful.",
        confirmButtonText: "PROCEED",
        ...getSwalTheme(),
      }).then((res) => {
        if (res.isConfirmed) navigate("/dashboard", { replace: true });
      });
    } catch {
      Swal.fire({
        icon: "error",
        title: "Login Failed",
        text: "Invalid email or password.",
        ...getSwalTheme(),
      });
    } finally {
      setLoading(false);
    }
  };

  // CapsLock detection
  const handlePasswordKeyEvent = (
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    const isCapsLock = e.getModifierState && e.getModifierState("CapsLock");
    setCapsLockOn(isCapsLock);
  };

  const handleInputFocus = () => setIsInputFocused(true);
  const handleInputBlur = () => setIsInputFocused(false);

  return (
    <div
      className="relative min-h-screen w-full bg-cover bg-center bg-no-repeat flex items-center justify-center"
      style={{
        backgroundImage: `url('/assets/admin_bg.jpg')`, // your supermarket background
      }}
    >
      {/* Maintenance Ribbon (top) */}
      {maintenanceMode && (
        <div className="absolute top-0 left-0 w-full z-30">
          <div className="bg-amber-500/95 text-white text-xs sm:text-sm px-4 py-2 flex items-center justify-center gap-2 shadow-md">
            <span className="inline-flex h-2 w-2 rounded-full bg-white animate-pulse" />
            <span className="font-semibold uppercase tracking-wide">
              Scheduled Maintenance:
            </span>
            <span className="text-[0.7rem] sm:text-xs">
              System optimization tonight from 10:00 PM to 11:30 PM. Some
              features may be temporarily unavailable.
            </span>
          </div>
        </div>
      )}

      {/* Global overlay + spotlight effect */}
      <div
        className={`absolute inset-0 backdrop-blur-[2px] transition-colors duration-300 z-0 ${
          isInputFocused ? "bg-black/40" : "bg-white/25"
        }`}
      />

      {/* Floating grocery icons */}
      <motion.div
        className="absolute left-10 top-16 text-green-800/30"
        animate={{ y: [0, -12, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      >
        <HiShoppingCart size={40} />
      </motion.div>

      <motion.div
        className="absolute right-16 bottom-24 text-green-800/30"
        animate={{ y: [0, 14, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
      >
        <HiTag size={36} />
      </motion.div>

      <motion.div
        className="absolute left-1/2 bottom-10 text-green-800/25"
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      >
        <HiCube size={34} />
      </motion.div>

      {/* Barcode scanner line (subtle) */}
      <motion.div
        className="absolute top-1/2 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-green-400/80 to-transparent opacity-60"
        animate={{ x: ["-20%", "20%", "-20%"] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Card wrapper with neon glow / glass shelf */}
      <div className="relative z-20 w-full px-4 sm:px-6">
        {/* Neon under-glow */}
        <div className="mx-auto max-w-4xl pointer-events-none">
          <div className="mx-auto h-6 w-3/4 rounded-full bg-green-500/40 blur-2xl opacity-70" />
        </div>

        {/* Main card */}
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="
            relative mx-auto mt-3 max-w-4xl 
            rounded-3xl bg-white/90 backdrop-blur-2xl
            border border-white/70 shadow-[0_20px_50px_rgba(0,0,0,0.35)]
            ring-1 ring-white/70
            overflow-hidden
          "
        >
          {/* Top bar with clock + role badge */}
          <div className="flex items-center justify-between px-6 py-3 border-b border-gray-200/70 bg-white/80">
            <div className="flex items-center gap-3 text-xs sm:text-sm text-gray-600">
              <span className="inline-flex h-2 w-2 rounded-full bg-green-500 mr-1" />
              <span className="font-semibold text-gray-800 uppercase tracking-wide">
                Grocery Admin System
              </span>
              <span className="hidden sm:inline text-gray-400">
                • Operational Dashboard Access
              </span>
              <span className="hidden sm:inline-flex items-center rounded-full bg-emerald-100 text-emerald-700 text-[0.65rem] font-semibold px-2 py-0.5 uppercase tracking-wide">
                Admin Role
              </span>
            </div>
            <div className="text-right text-xs sm:text-sm text-gray-700 font-mono">
              <div>{clock.time}</div>
              <div className="text-[0.7rem] sm:text-[0.75rem] text-gray-500">
                {clock.date}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5">
            {/* Left brand panel */}
            <div className="md:col-span-2 border-b md:border-b-0 md:border-r border-gray-200/70 bg-gradient-to-br from-green-700 via-green-600 to-green-500 text-white p-6 sm:p-7 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-11 w-11 flex items-center justify-center rounded-2xl bg-white/15 shadow-lg">
                    <HiShoppingCart size={24} className="text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-xl font-bold leading-tight">
                      CarryGrocer
                    </h2>
                    <p className="text-xs sm:text-sm text-white/80">
                      Retail & Inventory Management Portal
                    </p>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-white/85 mb-4 leading-relaxed">
                  Secure access for administrators to oversee checkout lanes,
                  inventory levels, pricing, and delivery operations across the
                  store.
                </p>

                <ul className="space-y-2 text-xs sm:text-sm text-white/90">
                  <li className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
                    Monitor orders, drivers, and product inventory
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
                    Real-time analytics for store performance
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
                    Role-based secure administrator access
                  </li>
                </ul>
              </div>

              <div className="mt-6 pt-4 border-t border-white/25 text-[0.7rem] sm:text-xs text-white/80 flex items-center justify-between gap-2">
                <span>Authorized Personnel Only</span>
                <span className="uppercase tracking-wide font-semibold">
                  Admin Access
                </span>
              </div>
            </div>

            {/* Right login form panel */}
            <div className="md:col-span-3 p-6 sm:p-8 bg-white/90">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-1 text-center md:text-left">
                Admin Login
              </h1>
              <p className="text-gray-500 text-sm mb-4 text-center md:text-left">
                Sign in with your administrator credentials
              </p>

              {/* System status row */}
              <div className="mb-4 flex flex-wrap gap-2 text-[0.7rem] sm:text-xs">
                {systemStatus.map((item) => (
                  <div
                    key={item.label}
                    className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-1 border border-gray-200"
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${item.color}`}
                    />
                    <span className="font-semibold text-gray-700">
                      {item.label}:
                    </span>
                    <span className="text-gray-600">{item.status}</span>
                  </div>
                ))}
              </div>

              <form className="space-y-5" onSubmit={handleLogin}>
                {/* Email */}
                <div>
                  <label className="text-xs sm:text-sm font-medium text-gray-700 mb-1 block">
                    Email Address
                  </label>

                  <div className="relative group">
                    <HiUser className="absolute left-3 top-2.5 text-gray-500 group-focus-within:text-green-700 transition" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onFocus={handleInputFocus}
                      onBlur={handleInputBlur}
                      placeholder="admin@store.com"
                      className="
                        w-full pl-10 pr-3 py-2.5 rounded-lg 
                        bg-white/80 border border-gray-300 
                        text-gray-800 text-sm
                        focus:ring-2 focus:ring-green-600 focus:border-green-600
                        transition
                      "
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs sm:text-sm font-medium text-gray-700">
                      Password
                    </label>
                    {capsLockOn && (
                      <span className="text-[0.7rem] text-amber-600 font-medium">
                        CAPS LOCK is ON
                      </span>
                    )}
                  </div>

                  <div className="relative group">
                    <HiLockClosed className="absolute left-3 top-2.5 text-gray-500 group-focus-within:text-green-700 transition" />

                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onKeyUp={handlePasswordKeyEvent}
                      onKeyDown={handlePasswordKeyEvent}
                      onFocus={handleInputFocus}
                      onBlur={handleInputBlur}
                      placeholder="••••••••"
                      className="
                        w-full pl-10 pr-10 py-2.5 rounded-lg 
                        bg-white/80 border border-gray-300 
                        text-gray-800 text-sm
                        focus:ring-2 focus:ring-green-600 focus:border-green-600
                        transition
                      "
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-gray-500 hover:text-green-700 transition"
                    >
                      {showPassword ? <HiEyeOff /> : <HiEye />}
                    </button>
                  </div>
                </div>

                {/* Remember me + helper text */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={() => setRememberMe(!rememberMe)}
                        className="peer sr-only"
                      />
                      <div
                        className="
                          h-4 w-8 rounded-full bg-gray-300 
                          peer-checked:bg-green-600 transition-all
                        "
                      />
                      <div
                        className="
                          absolute top-[-2px] left-[-2px] h-6 w-6 rounded-full bg-white 
                          border border-gray-300 shadow-sm
                          peer-checked:translate-x-4 peer-checked:border-green-600
                          transition-transform
                        "
                      />
                    </div>
                    <span className="text-xs sm:text-sm text-gray-700">
                      Remember this device
                    </span>
                  </label>

                  <span className="text-xs text-gray-500 sm:text-right">
                    For security, always log out when using shared terminals.
                  </span>
                </div>

                {/* reCAPTCHA */}
                <div className="flex justify-center">
                  <ReCAPTCHA
                    sitekey="6LdiamErAAAAAKqiA3FrNCyMC_H2srGF1U0qebnV"
                    onChange={(v) => setRecaptchaValue(v)}
                  />
                </div>

                {/* Login button */}
                <Button
                  type="submit"
                  disabled={loading}
                  className="
                    w-full py-2.5 sm:py-3 
                    bg-gradient-to-br from-green-600 to-green-700
                    hover:from-green-700 hover:to-green-800
                    text-white text-sm sm:text-base font-semibold rounded-lg 
                    shadow-lg hover:shadow-green-400/40 
                    transition-all
                  "
                >
                  {loading ? "Logging in..." : "Login"}
                </Button>

                {/* Tips rotator */}
                <div className="mt-2 text-[0.7rem] sm:text-xs text-gray-500 flex items-center gap-2">
                  <span className="inline-flex h-1.5 w-1.5 rounded-full bg-green-500" />
                  <span>{tips[tipIndex]}</span>
                </div>

                {/* Footer info */}
                <div className="mt-3 text-[0.7rem] sm:text-xs text-gray-500 flex flex-col sm:flex-row justify-between gap-1">
                  <span>© {new Date().getFullYear()} Grocery Admin System</span>
                  <span>Version 1.0 • Carry Guide Admin</span>
                </div>
              </form>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
