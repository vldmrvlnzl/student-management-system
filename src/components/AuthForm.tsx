import { useState, ChangeEvent, FormEvent } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { User, Mail, Lock, LogIn, UserPlus } from "lucide-react";

export const AuthForm = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: "",
    });
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const toggleForm = () => {
        setIsLogin(!isLogin);
        setFormData({ username: "", email: "", password: "" });
        setError("");
    };

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        try {
            const url = isLogin
                ? "http://127.0.0.1:8000/api/accounts/login/"
                : "http://127.0.0.1:8000/api/accounts/register/";

            const payload = isLogin
                ? { username: formData.username, password: formData.password }
                : formData;

            const res = await axios.post(url, payload);

            if (isLogin) {
                localStorage.setItem("token", res.data.access);
                navigate("/dashboard");
            } else {
                toggleForm();
            }
        } catch (err: unknown) {
            if (axios.isAxiosError(err)) {
                setError(err.response?.data?.detail || "Invalid credentials.");
            } else {
                setError("An unexpected error occurred.");
            }
        }
    };

    return (
        <div className="min-h-screen flex">
            {/* Left: Form */}
            <div className="w-full md:w-1/2 flex items-center justify-center bg-white p-6 md:p-12">
                <div className="w-full max-w-md">
                    <h2 className="text-3xl font-bold text-violet-700 mb-6 flex items-center gap-2">
                        {isLogin ? <LogIn className="w-6 h-6" /> : <UserPlus className="w-6 h-6" />}
                        {isLogin ? "Login" : "Register"}
                    </h2>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="relative">
                            <User className="absolute left-3 top-3.5 text-violet-500 w-5 h-5" />
                            <input
                                type="text"
                                name="username"
                                placeholder="Username"
                                value={formData.username}
                                onChange={handleChange}
                                required
                                className="w-full pl-10 pr-4 py-3 rounded-xl border text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500 transition"
                            />
                        </div>

                        <AnimatePresence>
                            {!isLogin && (
                                <motion.div
                                    key="email"
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="relative"
                                >
                                    <Mail className="absolute left-3 top-3.5 text-violet-500 w-5 h-5" />
                                    <input
                                        type="email"
                                        name="email"
                                        placeholder="Email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                        className="w-full pl-10 pr-4 py-3 rounded-xl border text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500 transition"
                                    />
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="relative">
                            <Lock className="absolute left-3 top-3.5 text-violet-500 w-5 h-5" />
                            <input
                                type="password"
                                name="password"
                                placeholder="Password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                className="w-full pl-10 pr-4 py-3 rounded-xl border text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500 transition"
                            />
                        </div>

                        {error && <p className="text-sm text-red-600">{error}</p>}

                        <motion.button
                            whileTap={{ scale: 0.97 }}
                            type="submit"
                            className="w-full py-3 bg-violet-600 hover:bg-violet-700 text-white rounded-xl transition"
                        >
                            {isLogin ? "Sign In" : "Register"}
                        </motion.button>
                    </form>
                </div>
            </div>

            {/* Right: Visual Panel with animated background */}
            <div className="hidden md:flex w-1/2 h-screen relative overflow-hidden bg-gradient-to-br from-violet-300 via-violet-500 to-violet-700">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10" />
                <div className="absolute w-72 h-72 bg-white/10 rounded-full top-10 -left-16 blur-2xl animate-ping" />
                <div className="absolute w-40 h-40 bg-white/10 rounded-full bottom-32 right-10 blur-2xl animate-ping delay-200" />
                <div className="absolute w-24 h-24 bg-white/10 rounded-full top-1/2 left-1/3 blur-2xl animate-ping delay-500" />

                {/* Particle dots */}
                <div className="absolute top-0 left-0 w-full h-full z-0">
                    {[...Array(30)].map((_, i) => (
                        <div
                            key={i}
                            className="absolute w-1 h-1 bg-white/20 rounded-full animate-pulse"
                            style={{
                                top: `${Math.random() * 100}%`,
                                left: `${Math.random() * 100}%`,
                                animationDelay: `${Math.random() * 2}s`,
                            }}
                        />
                    ))}
                </div>

                <div className="absolute inset-0 flex flex-col justify-end items-start p-10 text-white z-10">
                    <motion.h1
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="text-5xl font-extrabold mb-2 leading-tight font-serif italic tracking-wide drop-shadow-lg"
                        style={{ fontFamily: "'Playfair Display', serif" }}
                    >
                        Welcome<br />to CvSU Flow
                    </motion.h1>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, duration: 0.6 }}
                        className="text-sm"
                    >
                        {isLogin ? (
                            <span>
                                Don’t have an account? {" "}
                                <button
                                    onClick={toggleForm}
                                    className="underline hover:text-white/80"
                                >
                                    Register
                                </button>
                            </span>
                        ) : (
                            <span>
                                Already have an account? {" "}
                                <button
                                    onClick={toggleForm}
                                    className="underline hover:text-white/80"
                                >
                                    Login
                                </button>
                            </span>
                        )}
                    </motion.div>
                </div>
            </div>
        </div>
    );
};
