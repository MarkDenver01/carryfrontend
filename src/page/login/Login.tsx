import React, { useState } from "react";
import type { FormEvent } from "react"; // ✅ Correct type import
import { Button } from "flowbite-react";
import { useNavigate } from "react-router-dom";
import ReCAPTCHA from "react-google-recaptcha";
import { login } from "../../libs/ApiGatewayDatasource.ts";
import { useAuth } from "../../context/AuthContext.tsx";
import Swal from "sweetalert2";
import { getSwalTheme } from "../../utils/getSwalTheme";
import type { LoginResponse } from "../../libs/models/login";
import { HiLockClosed, HiUser, HiEye, HiEyeOff } from "react-icons/hi";
import { motion } from "framer-motion";

const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [recaptchaValue, setRecaptchaValue] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { setAuth } = useAuth();

  // 📌 ORIGINAL LOGIC (unchanged)
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

  return (
    <div
      className="min-h-screen w-full bg-cover bg-center bg-no-repeat flex items-center justify-center"
      style={{
        backgroundImage: `url('/assets/admin_bg.jpg')`, // <-- Your supermarket background stays here
      }}
    >
      {/* Soft overlay to help readability */}
      <div className="absolute inset-0 bg-white/25 backdrop-blur-sm"></div>

      {/* Login Card */}
      <motion.div
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="
          relative z-10 w-full max-w-md
          bg-white/80 backdrop-blur-xl 
          border border-gray-300 shadow-2xl
          rounded-2xl p-8
        "
      >
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-3xl font-bold text-center text-gray-800 mb-1"
        >
          Admin Portal
        </motion.h1>

        <p className="text-center text-gray-600 mb-6">
          Sign in to manage store operations
        </p>

        <form className="space-y-6" onSubmit={handleLogin}>
          {/* EMAIL */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              Email Address
            </label>

            <div className="relative group">
              <HiUser className="absolute left-3 top-3 text-gray-500 group-focus-within:text-green-700 transition" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@store.com"
                className="
                  w-full pl-10 pr-3 py-2.5 rounded-lg 
                  bg-white/70 border border-gray-300 
                  text-gray-800
                  focus:ring-2 focus:ring-green-600 focus:border-green-600
                  backdrop-blur-md transition
                "
              />
            </div>
          </div>

          {/* PASSWORD */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              Password
            </label>

            <div className="relative group">
              <HiLockClosed className="absolute left-3 top-3 text-gray-500 group-focus-within:text-green-700 transition" />

              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="
                  w-full pl-10 pr-10 py-2.5 rounded-lg 
                  bg-white/70 border border-gray-300 
                  text-gray-800
                  focus:ring-2 focus:ring-green-600 focus:border-green-600
                  backdrop-blur-md transition
                "
              />

              <span
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-gray-500 hover:text-green-700 cursor-pointer"
              >
                {showPassword ? <HiEyeOff /> : <HiEye />}
              </span>
            </div>
          </div>

          {/* RECAPTCHA */}
          <div className="flex justify-center">
            <ReCAPTCHA
              sitekey="6LdiamErAAAAAKqiA3FrNCyMC_H2srGF1U0qebnV"
              onChange={(v) => setRecaptchaValue(v)}
            />
          </div>

          {/* LOGIN BUTTON */}
          <Button
            type="submit"
            disabled={loading}
            className="
              w-full py-3 bg-green-700 hover:bg-green-800
              text-white text-lg font-semibold rounded-lg 
              shadow-lg hover:shadow-green-300/30 
              transition-all
            "
          >
            {loading ? "Logging in..." : "Login"}
          </Button>
        </form>

        <p className="text-center text-gray-600 text-sm mt-6">
          © {new Date().getFullYear()} Grocery Admin System
        </p>
      </motion.div>
    </div>
  );
};

export default Login;
