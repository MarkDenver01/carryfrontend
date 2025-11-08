import { createContext, useState, useContext, useEffect, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import type { LoginResponse } from "../libs/models/login";
import type { UserResponse } from "../libs/models/user";

interface AuthContextType {
  user: LoginResponse | null;
  isAuthenticated: boolean;
  logout: () => void;
  setAuth: (user: LoginResponse | null) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  logout: () => {},
  setAuth: () => {},
});

// 🔍 Decode JWT and extract timestamps
const parseJwtTimestamps = (token: string): { issuedAt: string; expiration: string } => {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    const payload = JSON.parse(jsonPayload);

    const issuedAt = payload.iat ? new Date(payload.iat * 1000).toISOString() : "";
    const expiration = payload.exp ? new Date(payload.exp * 1000).toISOString() : "";

    return { issuedAt, expiration };
  } catch {
    return { issuedAt: "", expiration: "" };
  }
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const navigate = useNavigate();

  // ✅ Initialize user from localStorage
  const [user, setUser] = useState<LoginResponse | null>(() => {
    const token = localStorage.getItem("jwtToken");
    const role = localStorage.getItem("authorized_role");
    const username = localStorage.getItem("authorized_username");
    const adminInfo = localStorage.getItem("authorized_admin_info");

    if (!token || !role || !username || !adminInfo) return null;

    let parsedAdmin: UserResponse;
    try {
      parsedAdmin = JSON.parse(adminInfo);
    } catch {
      parsedAdmin = {
        userId: 0,
        userName: username,
        email: "",
        createdAt: "",
        profileUrl: "",
        accountStatus: "UNKNOWN",
      };
    }

    const { issuedAt, expiration } = parseJwtTimestamps(token);

    return {
      jwtToken: token,
      jwtIssuedAt: issuedAt,
      jwtExpirationTime: expiration,
      role,
      username,
      userResponse: parsedAdmin,
    };
  });

  // ✅ Save or clear auth info
  const setAuth = (userData: LoginResponse | null) => {
    if (userData) {
      localStorage.setItem("jwtToken", userData.jwtToken);
      localStorage.setItem("authorized_role", userData.role);
      localStorage.setItem("authorized_username", userData.username);
      localStorage.setItem("authorized_admin_info", JSON.stringify(userData.userResponse));
    } else {
      localStorage.removeItem("jwtToken");
      localStorage.removeItem("authorized_role");
      localStorage.removeItem("authorized_username");
      localStorage.removeItem("authorized_admin_info");
    }
    setUser(userData);
  };

  // 🚪 Manual logout
  const logout = () => {
    localStorage.removeItem("jwtToken");
    localStorage.removeItem("authorized_role");
    localStorage.removeItem("authorized_username");
    localStorage.removeItem("authorized_admin_info");
    setUser(null);
    navigate("/login");
  };

  // ⏰ Auto-logout when JWT expires
  useEffect(() => {
    if (!user?.jwtExpirationTime) return;

    const checkExpiration = () => {
      const now = new Date().getTime();
      const exp = new Date(user.jwtExpirationTime).getTime();

      if (exp && now >= exp) {
        console.warn("⚠️ JWT expired, logging out automatically.");
        logout();
      }
    };

    // Check every 30 seconds
    const interval = setInterval(checkExpiration, 30_000);
    checkExpiration(); // run once immediately

    return () => clearInterval(interval);
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, logout, setAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
