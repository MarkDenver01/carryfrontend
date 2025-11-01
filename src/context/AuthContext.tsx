import {createContext, useState, useContext, type ReactNode, useEffect} from "react";
import type { LoginResponse } from '../libs/models/login';
import { useNavigate } from "react-router-dom";

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

export const AuthProvider = ({ children }: { children: ReactNode }) => {
     const navigate = useNavigate();
     const [user, setUser] = useState<LoginResponse | null>(() => {
        const token = localStorage.getItem("jwtToken");
        const role = localStorage.getItem("authorized_role");
        const username = localStorage.getItem("authorized_username");
        const adminInfo = localStorage.getItem("authorized_admin_info");

        if (!token || !role || !username || !adminInfo) return null;
        
        let parsedAdmin = {} as any;
        try {
            parsedAdmin = JSON.parse(adminInfo);
        } catch {
            parsedAdmin = { accountStatus: "UNKNOWN" };
        }
        return { jwtToken: token, role, username, userResponse: parsedAdmin };
     });

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

    const logout = () => {
            localStorage.removeItem("jwtToken");
            localStorage.removeItem("authorized_role");
            localStorage.removeItem("authorized_username");
            localStorage.removeItem("authorized_admin_info");
            setUser(null);
            navigate("/login");
    };

    return (
        <AuthContext.Provider value={{ user, isAuthenticated: !!user, logout, setAuth }}>
        {children}
        </AuthContext.Provider>
    );

};

export const useAuth = () => useContext(AuthContext);

