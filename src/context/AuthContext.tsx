import {createContext, useState, useContext, type ReactNode, useEffect} from "react";

interface AuthContextType {
    token: string | null;
    role: string | null;
    login: (token: string, role: string) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [token, setToken] = useState<string | null>(null);
    const [role, setRole] = useState<string | null>(null);

    useEffect(() => {
        const savedToken = localStorage.getItem("authToken");
        const savedRole = localStorage.getItem("authRole");

        if (savedToken && savedToken) {
            setToken(savedToken);
            setRole(savedRole);
        }
    }, []);


    const login = (newToken: string, newRole: string) => {
        setToken(newToken);
        setRole(newRole);
        localStorage.setItem("authToken", newToken);
        localStorage.setItem("authRole", newRole);
    };

    const logout = () => {
        setToken(null);
        setRole(null);
        localStorage.removeItem("authToken");
        localStorage.removeItem("authRole");
    };

    return (
        <AuthContext.Provider value={{ token, role, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth must be used within AuthProvider");
    return context;
};
