import React, { useState, type FormEvent } from 'react';
import { Button } from 'flowbite-react';
import { useNavigate } from 'react-router-dom';
import ReCAPTCHA from 'react-google-recaptcha';
import api from '../../libs/api.ts';
import {useAuth} from "../../context/AuthContext.tsx";

const Login: React.FC = () => {
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [recaptchaValue, setRecaptchaValue] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleLogin = async (e: FormEvent) => {
        e.preventDefault();

        if (!recaptchaValue) {
            setError('Please complete the reCAPTCHA');
            return;
        }

        try {
            setLoading(true);
            setError('');

            // Fetch CSRF token
            await api.get('/csrf_token');

            const response = await api.post('/auth/public/user_login', {
                email,
                password,
            });

            const { jwtToken, roles } = response.data;

            if (roles[0] !== 'ROLE_ADMIN') {
                setError("Access denied.")
                return;
            }

            console.log('Login success:', response.data);
            login(jwtToken, roles[0]);
            navigate('/dashboard');
        } catch (err) {
            console.error(err);
            setError('Login failed. Please check credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            className="w-full max-w-sm p-4 bg-white border border-gray-200 rounded-lg shadow-sm sm:p-6 md:p-8 dark:bg-gray-800 dark:border-gray-700">
            <form className="space-y-6" onSubmit={handleLogin}>
                <h5 className="text-xl font-medium text-gray-900 dark:text-white">ADMIN PORTAL</h5>
                <div>
                    <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Email Address</label>
                    <input type="email" name="email" id="email"
                           className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
                           placeholder="Enter your email" value={email} onChange={(e) => setEmail(e.target.value)}
                           required/>
                </div>
                <div>
                    <label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Password</label>
                    <input type="password" name="password" id="password" placeholder="••••••••"
                           className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
                           value={password} onChange={(e) => setPassword(e.target.value)} required/>
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
