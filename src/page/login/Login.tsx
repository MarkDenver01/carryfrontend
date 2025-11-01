import React, { useState, type FormEvent } from 'react';
import { Button } from 'flowbite-react';
import { useNavigate } from 'react-router-dom';
import ReCAPTCHA from 'react-google-recaptcha';
import { login } from "../../libs/ApiGatewayDatasource.ts";
import {useAuth} from "../../context/AuthContext.tsx";
import Swal from "sweetalert2";
import { getSwalTheme } from "../../utils/getSwalTheme";
import type { LoginResponse } from '../../libs/models/login';
import { HiLockClosed, HiUser, HiEye, HiEyeOff } from "react-icons/hi";

const Login: React.FC = () => {
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [showPassword, setShowPassword] = useState(false);
    const [recaptchaValue, setRecaptchaValue] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');
    const navigate = useNavigate();
    const { setAuth } = useAuth();

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
            setError('');

            const response: LoginResponse = await login({ email, password });
            setAuth(response);

            if (response.role !== 'ROLE_ADMIN') {
                 Swal.fire({
                    icon: "error",
                    title: "Access Denied",
                    text: `Non-administrator role is probihired to login.`,
                    confirmButtonText: "CLOSE",
                    ...getSwalTheme(),
                 });
                 return;
            }

            console.log('Login success:', response.username);
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
            console.error(err);
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
        <div
            className="w-full max-w-sm p-4 bg-white border border-gray-200 rounded-lg shadow-sm sm:p-6 md:p-8 dark:bg-gray-800 dark:border-gray-700">
            <form className="space-y-6" onSubmit={handleLogin}>
                <h5 className="text-xl font-medium text-gray-900 dark:text-white">ADMIN PORTAL</h5>
                <div className="relative">
                    <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Email Address</label>
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-[var(--button-color)]"><HiUser /></span>
                    <input type="email" name="email" id="email"
                           className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
                           placeholder="Enter your email" value={email} onChange={(e) => setEmail(e.target.value)}
                           required/>
                </div>
                <div className="relative">
                    <label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Password</label>
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-[var(--button-color)]"><HiLockClosed /></span>
                    <input 
                        type={showPassword ? "text" : "password"}
                        name="password" 
                        id="password" 
                        placeholder="••••••••" 
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white" 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} required/>
                        <span onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 cursor-pointer">
                            {showPassword ? <HiEyeOff /> : <HiEye />}
                        </span>
                </div>

                <div className="flex justify-center">
                    <ReCAPTCHA
                        sitekey="6LdiamErAAAAAKqiA3FrNCyMC_H2srGF1U0qebnV"
                        onChange={(value: string | null) => setRecaptchaValue(value)}
                    />
                </div>

                {error && <p className="text-sm text-red-600 text-center">{error}</p>}

                <Button type="submit"
                        disabled={loading}
                        className="w-full text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
                    {loading ? 'Logging in...' : 'Login'}
                </Button>
            </form>

        </div>

    );
};

export default Login;
