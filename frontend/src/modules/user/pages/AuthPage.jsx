import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, User, ArrowLeft, Leaf, Tag } from 'lucide-react';
import { motion } from 'framer-motion';
import authShowcaseImg from '../../../assets/auth_showcase.jpg';

const AuthPage = () => {
    const { login, signup } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // Determine initial mode based on state passed or default to 'login'
    const [isLogin, setIsLogin] = useState(true);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        // Removed referral code handling
    }, [location.search]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (isLogin) {
            const res = await login(formData.email, formData.password);
            if (res.success) {
                navigate('/otp-verification', { state: { contact: formData.email } });
            } else {
                setError(res.message);
            }
        } else {
            if (formData.password !== formData.confirmPassword) {
                setError('Passwords do not match');
                return;
            }
            if (formData.password.length < 6) {
                setError('Password must be at least 6 characters');
                return;
            }
            const res = await signup({
                name: formData.name,
                email: formData.email,
                password: formData.password
            });
            if (res.success) {
                navigate('/otp-verification', { state: { contact: formData.email } });
            } else {
                setError(res.message);
            }
        }
    };

    return (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 font-['Inter']">
            {/* Blurred Backdrop */}
            <div
                className="absolute inset-0 z-0 bg-cover bg-center"
                style={{
                    backgroundImage: "url('https://images.unsplash.com/photo-1596040033229-a9821ebd058d?q=80&w=2070&auto=format&fit=crop')",
                    filter: "blur(12px) brightness(0.5)",
                    transform: "scale(1.1)"
                }}
            />
            {/* Dark Overlay for contrast */}
            <div className="absolute inset-0 bg-black/30 z-0" />

            {/* Back Button */}
            <div className="absolute top-6 left-6 z-20">
                <button
                    onClick={() => navigate('/')}
                    className="flex items-center gap-2 text-white/80 hover:text-white transition-all font-medium backdrop-blur-md bg-black/20 px-4 py-2 rounded-full hover:bg-black/30"
                >
                    <ArrowLeft size={18} />
                    <span>Back</span>
                </button>
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="w-full max-w-[900px] h-auto md:h-[600px] bg-white rounded-2xl shadow-2xl overflow-hidden relative z-10 flex flex-col md:flex-row"
            >
                {/* Left Side - Image & Branding (Hidden on mobile) */}
                <div className="hidden md:flex w-1/2 bg-gray-100 relative items-center justify-center overflow-hidden">
                    <div
                        className="absolute inset-0 bg-cover bg-center"
                        style={{ backgroundImage: `url(${authShowcaseImg})` }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                    <div className="relative z-10 p-10 text-white text-center">
                        <div className="inline-flex p-4 rounded-full bg-white/10 backdrop-blur-md mb-6 border border-white/20">
                            <Leaf size={40} className="text-[#4ade80]" fill="currentColor" />
                        </div>
                        <h2 className="text-3xl font-bold font-['Poppins'] mb-3">Pure Goodness</h2>
                        <p className="text-white/80 text-sm leading-relaxed">
                            Experience the finest selection of organic dry fruits, delivered straight from the farm to your doorstep.
                        </p>
                    </div>
                </div>

                {/* Right Side - Form */}
                <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center bg-white relative">
                    <div className="text-center md:text-left mb-8">
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 font-['Poppins'] mb-2">
                            {isLogin ? 'Welcome Back' : 'Create Account'}
                        </h1>
                        <p className="text-gray-500 text-sm">
                            {isLogin ? 'Please enter your details to sign in.' : 'Start your healthy journey with us today.'}
                        </p>
                    </div>

                    {error && (
                        <div className="mb-5 bg-red-50 text-red-600 text-xs font-medium py-3 px-4 rounded-lg border border-red-100 flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {!isLogin && (
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-gray-700 ml-1">Full Name</label>
                                <div className="relative">
                                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        type="text"
                                        name="name"
                                        required
                                        value={formData.name}
                                        onChange={handleChange}
                                        className="w-full bg-gray-50 border border-gray-200 rounded-lg py-3 pl-10 pr-4 text-sm font-medium text-gray-900 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-gray-400"
                                        placeholder="Enter your name"
                                    />
                                </div>
                            </div>
                        )}

                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-gray-700 ml-1">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type="email"
                                    name="email"
                                    required
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-lg py-3 pl-10 pr-4 text-sm font-medium text-gray-900 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-gray-400"
                                    placeholder="name@company.com"
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-gray-700 ml-1">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    required
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-lg py-3 pl-10 pr-10 text-sm font-medium text-gray-900 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-gray-400"
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        {!isLogin && (
                            <>
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-gray-700 ml-1">Confirm Password</label>
                                    <div className="relative">
                                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            name="confirmPassword"
                                            required
                                            value={formData.confirmPassword}
                                            onChange={handleChange}
                                            className="w-full bg-gray-50 border border-gray-200 rounded-lg py-3 pl-10 pr-4 text-sm font-medium text-gray-900 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-gray-400"
                                            placeholder="••••••••"
                                        />
                                    </div>
                                </div>

                            </>
                        )}

                        <button
                            type="submit"
                            className="w-full bg-[#2c5336] text-white font-bold text-sm py-3.5 rounded-lg hover:bg-[#1f3b26] transition-all shadow-md active:translate-y-0.5 mt-2"
                        >
                            {isLogin ? 'Sign In' : 'Create Account'}
                        </button>
                    </form>

                    <div className="mt-auto pt-6 text-center">
                        <p className="text-gray-500 text-xs font-medium">
                            {isLogin ? "Don't have an account?" : "Already have an account?"}
                            <button
                                onClick={() => { setIsLogin(!isLogin); setError(''); }}
                                className="ml-1.5 text-[#2c5336] font-bold hover:underline transition-colors"
                            >
                                {isLogin ? 'Sign Up' : 'Log In'}
                            </button>
                        </p>
                    </div>
                </div>
            </motion.div >
        </div >
    );
};

export default AuthPage;
