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
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });

  const navigate = useNavigate();
  const { setAuth } = useAuth();

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

  // Clock
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

  // Tip Rotator
  useEffect(() => {
    const interval = setInterval(() => {
      setTipIndex((prev) => (prev + 1) % tips.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [tips.length]);

  // Login Logic (unchanged)
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

    if (response.role === "ADMIN") {
      Swal.fire({
        icon: "success",
        title: `Hi Super Admin! Your login is successful.`,
        text: "Tap proceed to continue.",
        confirmButtonText: "PROCEED",
        ...getSwalTheme(),
      }).then((result) => {
        if (result.isConfirmed) {
          navigate("dashboard", { replace: true });
        }
      });
    } else if (response.role === "SUB_ADMIN") {
      Swal.fire({
        icon: "success",
        title: `Hi Admin! Your login is successful.`,
        text: "Tap proceed to continue.",
        confirmButtonText: "PROCEED",
        ...getSwalTheme(),
      }).then((result) => {
        if (result.isConfirmed) {
          navigate("dashboard", { replace: true });
        }
      });
    } else {
      Swal.fire({
        icon: "error",
        title: "Access Denied",
        text: `Non-administrator role is prohibited to login.`,
        confirmButtonText: "CLOSE",
        ...getSwalTheme(),
      });
    }
  } catch (err) {
    console.error(err);
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

  const handlePasswordKeyEvent = (
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    const isCapsLock = e.getModifierState && e.getModifierState("CapsLock");
    setCapsLockOn(isCapsLock);
  };

  const handleInputFocus = () => setIsInputFocused(true);
  const handleInputBlur = () => setIsInputFocused(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setCursorPos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  return (
    <div
      className="relative min-h-screen w-full flex items-center justify-center overflow-hidden"
      style={{
        backgroundImage: `url('/assets/admin_emerald.jpg')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
      onMouseMove={handleMouseMove}
    >
      {/* Global overlay (subtle, no text blur) */}
      <div
        className={`absolute inset-0 transition-colors duration-300 z-0 ${
          isInputFocused ? "bg-black/55" : "bg-black/40"
        }`}
      />

      {/* HUD GRID BACKGROUND */}
      <div className="pointer-events-none absolute inset-0 -z-10 opacity-40 mix-blend-soft-light">
        <div className="w-full h-full bg-[linear-gradient(to_right,rgba(148,163,184,0.18)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.18)_1px,transparent_1px)] bg-[size:46px_46px]" />
      </div>

      {/* SCANLINE OVERLAY */}
      <div className="pointer-events-none absolute inset-0 -z-10 opacity-[0.08] mix-blend-soft-light bg-[repeating-linear-gradient(to_bottom,rgba(15,23,42,0.9)_0px,rgba(15,23,42,0.9)_1px,transparent_1px,transparent_3px)]" />

      {/* CURSOR-BASED SPOTLIGHT */}
      <motion.div
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background: `radial-gradient(520px at ${cursorPos.x}px ${cursorPos.y}px, rgba(34,197,94,0.30), transparent 70%)`,
        }}
        animate={{ opacity: [0.7, 1, 0.8] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* FLOATING BLOBS */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <motion.div
          className="absolute -top-24 -left-20 h-64 w-64 bg-emerald-500/28 blur-3xl"
          animate={{
            x: [0, 30, 10, -10, 0],
            y: [0, 10, 25, 10, 0],
            borderRadius: ["45%", "60%", "50%", "65%", "45%"],
          }}
          transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute -bottom-24 right-10 h-72 w-72 bg-emerald-400/22 blur-3xl"
          animate={{
            x: [0, -20, -10, 10, 0],
            y: [0, -15, -5, -10, 0],
            borderRadius: ["55%", "70%", "60%", "75%", "55%"],
          }}
          transition={{ duration: 26, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* Floating grocery icons (hologram style) */}
      <motion.div
        className="absolute left-10 top-16 text-emerald-300/40"
        animate={{ y: [0, -12, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      >
        <HiShoppingCart size={40} />
      </motion.div>

      <motion.div
        className="absolute right-16 bottom-24 text-emerald-300/40"
        animate={{ y: [0, 14, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
      >
        <HiTag size={36} />
      </motion.div>

      <motion.div
        className="absolute left-1/2 bottom-10 text-emerald-300/30"
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      >
        <HiCube size={34} />
      </motion.div>

      {/* Scanner Line */}
      <motion.div
        className="absolute top-1/2 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-emerald-400/80 to-transparent opacity-60"
        animate={{ x: ["-20%", "20%", "-20%"] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Card container */}
      <div className="relative z-20 w-full px-4 sm:px-6">
        {/* Glow shadow under card */}
        <div className="mx-auto max-w-4xl pointer-events-none">
          <div className="mx-auto h-6 w-3/4 rounded-full bg-emerald-500/40 blur-2xl opacity-70" />
        </div>

        {/* MAIN CARD (HUD STYLE) */}
        <motion.div
          initial={{ opacity: 0, y: 28, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="
            relative mx-auto mt-2 max-w-4xl 
            rounded-[26px] 
            bg-slate-950/85 
            border border-emerald-500/35 
            shadow-[0_24px_80px_rgba(15,23,42,0.85)]
            overflow-hidden
          "
        >
          {/* HUD brackets */}
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute top-3 left-3 h-5 w-5 border-t-2 border-l-2 border-emerald-400/80" />
            <div className="absolute top-3 right-3 h-5 w-5 border-t-2 border-r-2 border-emerald-400/80" />
            <div className="absolute bottom-3 left-3 h-5 w-5 border-b-2 border-l-2 border-emerald-400/80" />
            <div className="absolute bottom-3 right-3 h-5 w-5 border-b-2 border-r-2 border-emerald-400/80" />
          </div>

          {/* Subtle top glossy strip */}
          <div className="absolute inset-x-0 top-0 h-10 bg-gradient-to-b from-white/10 via-transparent to-transparent pointer-events-none" />

          {/* Top bar */}
          <div className="flex items-center justify-between px-6 py-3 border-b border-emerald-500/30 bg-slate-950/90">
            <div className="flex items-center gap-3 text-xs sm:text-sm text-emerald-100">
              <span className="inline-flex h-2 w-2 rounded-full bg-emerald-400 mr-1 shadow-[0_0_10px_rgba(52,211,153,0.9)]" />
              <span className="font-semibold uppercase tracking-wide text-emerald-100">
                CarryGrocer Admin Console
              </span>
              <span className="hidden sm:inline text-emerald-300/80">
                • Secure Operations Access
              </span>
              <span className="hidden sm:inline-flex items-center rounded-full bg-emerald-900/70 text-emerald-300 text-[0.65rem] font-semibold px-2 py-0.5 uppercase tracking-wide border border-emerald-500/60">
                Admin Role
              </span>
            </div>
            <div className="text-right text-xs sm:text-sm text-emerald-100 font-mono">
              <div>{clock.time}</div>
              <div className="text-[0.7rem] sm:text-[0.75rem] text-emerald-300/80">
                {clock.date}
              </div>
            </div>
          </div>

          {/* Content grid */}
          <div className="grid grid-cols-1 md:grid-cols-5">
            {/* LEFT PANEL (Info / Brand) */}
            <div className="md:col-span-2 border-b md:border-b-0 md:border-r border-emerald-500/30 bg-gradient-to-br from-emerald-700 via-emerald-600 to-emerald-500 text-white p-6 sm:p-7 flex flex-col justify-between relative overflow-hidden">
              {/* decorative gradient lines */}
              <div className="pointer-events-none absolute inset-0 opacity-60">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.20),transparent_55%)]" />
                <motion.div
                  className="absolute -left-10 top-10 h-40 w-40 bg-white/10"
                  animate={{ x: [0, 30, 10, -10, 0], rotate: [0, 6, -3, 4, 0] }}
                  transition={{ duration: 18, repeat: Infinity }}
                />
              </div>

              <div className="relative">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-11 w-11 flex items-center justify-center rounded-2xl bg-white/15 shadow-lg shadow-emerald-900/60">
                    <HiShoppingCart size={24} className="text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-xl font-bold leading-tight">
                      CarryGrocer
                    </h2>
                    <p className="text-xs sm:text-sm text-emerald-100/90">
                      Retail & Inventory Management Portal
                    </p>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-emerald-50/95 mb-4 leading-relaxed">
                  Secure access for administrators to oversee checkout lanes,
                  inventory levels, pricing, and delivery operations across the
                  store network.
                </p>

                <ul className="space-y-2 text-xs sm:text-sm text-emerald-50/95">
                  <li className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-300 shadow-[0_0_8px_rgba(167,243,208,0.9)]" />
                    Monitor orders, drivers, and product inventory in updates.
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-300 shadow-[0_0_8px_rgba(167,243,208,0.9)]" />
                    Track store performance and demand analytics
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-300 shadow-[0_0_8px_rgba(167,243,208,0.9)]" />
                    Role-based secure access for Admin & Super Admin
                  </li>
                </ul>
              </div>

              <div className="relative mt-6 pt-4 border-t border-emerald-300/35 text-[0.7rem] sm:text-xs text-emerald-50/90 flex items-center justify-between gap-2">
                <span>Authorized Personnel Only</span>
                <span className="uppercase tracking-[0.18em] font-semibold text-emerald-100">
                  ADMIN ACCESS
                </span>
              </div>
            </div>

            {/* RIGHT PANEL (Form) */}
            <div className="md:col-span-3 p-6 sm:p-8 bg-slate-950/90 text-slate-50">
              <h1 className="text-2xl sm:text-3xl font-bold text-emerald-100 mb-1 text-center md:text-left">
                Admin Login
              </h1>
              <p className="text-emerald-200/80 text-sm mb-4 text-center md:text-left">
                Sign in with your administrator credentials
              </p>

              {/* System status */}
              <div className="mb-4 flex flex-wrap gap-2 text-[0.7rem] sm:text-xs">
                {systemStatus.map((item) => (
                  <div
                    key={item.label}
                    className="inline-flex items-center gap-1 rounded-full bg-slate-900/70 px-2 py-1 border border-emerald-500/50"
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${item.color} shadow-[0_0_10px_rgba(52,211,153,0.9)]`}
                    />
                    <span className="font-semibold text-emerald-100">
                      {item.label}:
                    </span>
                    <span className="text-emerald-200/90">{item.status}</span>
                  </div>
                ))}
              </div>

              <form className="space-y-5" onSubmit={handleLogin}>
                {/* Email */}
                <div>
                  <label className="text-xs sm:text-sm font-medium text-emerald-100 mb-1 block">
                    Email Address
                  </label>

                  <div className="relative group">
                    <HiUser className="absolute left-3 top-2.5 text-emerald-300 group-focus-within:text-emerald-400 transition" />
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
                        bg-slate-900/80 border border-emerald-600/60 
                        text-emerald-50 text-sm
                        focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400
                        outline-none
                        transition
                      "
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs sm:text-sm font-medium text-emerald-100">
                      Password
                    </label>
                    {capsLockOn && (
                      <span className="text-[0.7rem] text-amber-400 font-medium">
                        CAPS LOCK is ON
                      </span>
                    )}
                  </div>

                  <div className="relative group">
                    <HiLockClosed className="absolute left-3 top-2.5 text-emerald-300 group-focus-within:text-emerald-400 transition" />

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
                        bg-slate-900/80 border border-emerald-600/60 
                        text-emerald-50 text-sm
                        focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400
                        outline-none
                        transition
                      "
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-emerald-300 hover:text-emerald-100 transition"
                    >
                      {showPassword ? <HiEyeOff /> : <HiEye />}
                    </button>
                  </div>
                </div>

                {/* Remember me */}
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
                          h-4 w-8 rounded-full bg-slate-700 
                          peer-checked:bg-emerald-500 transition-all
                        "
                      />
                      <div
                        className="
                          absolute top-[-2px] left-[-2px] h-6 w-6 rounded-full bg-slate-900 
                          border border-slate-500 shadow-sm
                          peer-checked:translate-x-4 peer-checked:border-emerald-400
                          transition-transform
                        "
                      />
                    </div>
                    <span className="text-xs sm:text-sm text-emerald-100">
                      Remember this device
                    </span>
                  </label>

                  <span className="text-xs text-emerald-300/80 sm:text-right">
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

                <Button
                  type="submit"
                  disabled={loading}
                  className="
                    w-full py-2.5 sm:py-3 
                    bg-gradient-to-br from-emerald-500 to-emerald-600
                    hover:from-emerald-500 hover:to-emerald-400
                    text-white text-sm sm:text-base font-semibold rounded-lg 
                    shadow-lg hover:shadow-[0_0_30px_rgba(34,197,94,0.7)]
                    transition-all
                    border border-emerald-400/80
                    focus:outline-none
                  "
                >
                  {loading ? "Logging in..." : "Login"}
                </Button>

                <div className="mt-2 text-[0.7rem] sm:text-xs text-emerald-200/90 flex items-center gap-2">
                  <span className="inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.9)]" />
                  <span>{tips[tipIndex]}</span>
                </div>

                <div className="mt-3 text-[0.7rem] sm:text-xs text-emerald-300/90 flex flex-col sm:flex-row justify-between gap-1">
                  <span>
                    © {new Date().getFullYear()} Grocery Admin System
                  </span>
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
