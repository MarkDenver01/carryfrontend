import React, { useState, type FormEvent } from 'react';
import { Button } from 'flowbite-react';
import { useNavigate } from 'react-router-dom';
import ReCAPTCHA from 'react-google-recaptcha';
import { login } from "../../libs/ApiGatewayDatasource.ts";
import { useAuth } from "../../context/AuthContext.tsx";
import Swal from "sweetalert2";
import { getSwalTheme } from "../../utils/getSwalTheme";
import type { LoginResponse } from '../../libs/models/login';
import { HiLockClosed, HiUser, HiEye, HiEyeOff } from "react-icons/hi";
import { motion } from "framer-motion"; // Animation

const Login: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState(false);
  const [recaptchaValue, setRecaptchaValue] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [rememberMe, setRememberMe] = useState<boolean>(false);

  const navigate = useNavigate();
  const { setAuth } = useAuth();

  // 🔥 All your logic remains EXACTLY the same
  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();

    if (!recaptchaValue) {
      Swal.fire({
        icon: "error",
        title: "Invalid Captcha",
        text: `Please complete the captcha.`,
        confirmButtonText: "CLOSE",
        ...getSwalTheme(),
      });
      return;
    }

    try {
      setLoading(true);

      const response: LoginResponse = await login({ email, password });
      setAuth(response);

      if (response.role !== 'ADMIN') {
        Swal.fire({
          icon: "error",
          title: "Access Denied",
          text: `Non-administrator role is prohibited to login.`,
          confirmButtonText: "CLOSE",
          ...getSwalTheme(),
        });
        return;
      }

      Swal.fire({
        icon: "success",
        title: `Hi ${response.username}! Your login is successful.`,
        text: "Tap proceed to continue.",
        confirmButtonText: "PROCEED",
        ...getSwalTheme(),
      }).then((result) => {
        if (result.isConfirmed) {
          navigate("/dashboard", { replace: true });
        }
      });
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Access Denied",
        text: `Please check the account credentials.`,
        confirmButtonText: "CLOSE",
        ...getSwalTheme(),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-blue-100 to-blue-200 dark:from-gray-900 dark:to-gray-800">

      {/* LEFT PANEL */}
      <div className="hidden lg:flex flex-col justify-center items-center w-1/2 text-white p-10 relative">
        <motion.img
          src="https://cdn-icons-png.flaticon.com/512/7987/7987701.png"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1 }}
          className="w-52 mb-6 drop-shadow-lg"
        />

        <motion.h1
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-4xl font-bold text-center"
        >
          Carry Guide Admin Portal
        </motion.h1>

        <motion.p
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-lg text-center max-w-md mt-4 opacity-90"
        >
          Manage orders, drivers, products, analytics and more.
        </motion.p>

        {/* Floating decorations */}
        <motion.div
          animate={{ y: [0, -20, 0] }}
          transition={{ repeat: Infinity, duration: 4 }}
          className="absolute top-10 right-20 w-16 h-16 bg-white/30 rounded-full blur-xl"
        />
        <motion.div
          animate={{ y: [0, 30, 0] }}
          transition={{ repeat: Infinity, duration: 5 }}
          className="absolute bottom-10 left-16 w-20 h-20 bg-white/20 rounded-full blur-xl"
        />
      </div>

      {/* RIGHT PANEL – Login Form */}
      <div className="flex w-full lg:w-1/2 justify-center items-center p-6">

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl 
          border border-gray-200 dark:border-gray-700 rounded-2xl p-8 shadow-2xl"
        >
          <h2 className="text-3xl font-bold text-center text-gray-800 dark:text-white mb-1">
            Welcome Back
          </h2>
          <p className="text-center text-gray-500 dark:text-gray-400 mb-6">
            Sign in to your admin account
          </p>

          <form className="space-y-6" onSubmit={handleLogin}>

            {/* EMAIL */}
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                Email Address
              </label>
              <div className="relative group">
                <HiUser className="absolute left-3 top-3 text-gray-500 group-focus-within:text-blue-600 transition-all" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@example.com"
                  className="w-full pl-10 pr-3 py-2.5 rounded-lg bg-gray-50 dark:bg-gray-700 
                    border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white 
                    transition-all focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* PASSWORD */}
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                Password
              </label>

              <div className="relative group">
                <HiLockClosed className="absolute left-3 top-3 text-gray-500 group-focus-within:text-blue-600 transition-all" />

                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 rounded-lg bg-gray-50 dark:bg-gray-700 
                  border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white 
                  transition-all focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-500 hover:text-blue-600 transition"
                >
                  {showPassword ? <HiEyeOff /> : <HiEye />}
                </button>
              </div>
            </div>

            {/* REMEMBER + FORGOT */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-gray-600 dark:text-gray-300 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={() => setRememberMe(!rememberMe)}
                  className="rounded border-gray-300 dark:border-gray-500"
                />
                Remember me
              </label>

              <span className="text-blue-600 dark:text-blue-400 text-sm hover:underline cursor-pointer">
                Forgot Password?
              </span>
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
              className="w-full py-3 text-lg font-semibold rounded-lg bg-blue-700 hover:bg-blue-800 
              focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 
              dark:focus:ring-blue-800 transition-all shadow-xl hover:shadow-blue-400/30"
            >
              {loading ? "Logging in..." : "Login"}
            </Button>

            <p className="text-center text-gray-500 dark:text-gray-400 text-sm mt-4">
              © {new Date().getFullYear()} Carry Guide Admin Portal
            </p>

          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
