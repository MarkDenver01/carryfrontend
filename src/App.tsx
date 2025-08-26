import { Routes, Route, useLocation } from 'react-router-dom';
import bg from './assets/bg.svg';
import cary_admin_logo from './assets/cary_admin_logo.svg'
import './App.css';

import Login from './page/login/Login.tsx';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './layout/dashboard/DashboardLayout.tsx';
import type { JSX } from 'react';

function App(): JSX.Element {
    const location = useLocation();
    const isLoginPage = location.pathname === '/';

    return (
        <div
            className={
                isLoginPage
                    ? 'relative min-h-screen w-full bg-cover bg-no-repeat bg-center flex items-center justify-center'
                    : 'min-h-screen w-full'
            }
            style={isLoginPage ? { backgroundImage: `url(${bg})` } : {}}
        >
            {isLoginPage && (
                <div className="absolute top-4 right-4 w-[180px] h-[180px] opacity-90">
                    <img src={cary_admin_logo} alt="Logo background" className="w-full h-full opacity-90" />
                </div>
            )}

            <div className={isLoginPage ? 'z-10' : ''}>
                <Routes>
                    <Route path="/" element={<Login />} />
                    <Route
                        path="/dashboard/*"
                        element={
                            <ProtectedRoute>
                                <DashboardLayout />
                            </ProtectedRoute>
                        }
                    />
                </Routes>
            </div>
        </div>
    );
}

export default App;
