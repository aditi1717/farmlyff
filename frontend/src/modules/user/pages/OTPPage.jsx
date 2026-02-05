import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, ShieldCheck, RefreshCw, Smartphone } from 'lucide-react';
import toast from 'react-hot-toast';

const OTPPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [timer, setTimer] = useState(30);
    const [isLoading, setIsLoading] = useState(false);
    const inputRefs = useRef([]);

    // Get email/phone from previous navigation state
    const contactInfo = location.state?.contact || 'your registered contact';

    useEffect(() => {
        if (timer > 0) {
            const interval = setInterval(() => setTimer(prev => prev - 1), 1000);
            return () => clearInterval(interval);
        }
    }, [timer]);

    const handleChange = (index, value) => {
        if (isNaN(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value.substring(value.length - 1);
        setOtp(newOtp);

        // Move to next input if value is entered
        if (value && index < 5) {
            inputRefs.current[index + 1].focus();
        }
    };

    const handleKeyDown = (index, e) => {
        // Move to previous input on backspace if empty
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1].focus();
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const data = e.clipboardData.getData('text').slice(0, 6);
        if (!/^\d+$/.test(data)) return;

        const pasteData = data.split('');
        const newOtp = [...otp];
        pasteData.forEach((char, i) => {
            if (i < 6) newOtp[i] = char;
        });
        setOtp(newOtp);

        // Focus last filled or next empty
        const lastIndex = Math.min(pasteData.length, 5);
        inputRefs.current[lastIndex].focus();
    };

    const handleVerify = async (e) => {
        e.preventDefault();
        const fullOtp = otp.join('');
        if (fullOtp.length < 6) {
            toast.error('Please enter complete 6-digit OTP');
            return;
        }

        setIsLoading(true);
        // Simulate API call
        setTimeout(() => {
            setIsLoading(false);
            if (fullOtp === '123456') { // Demo OTP
                toast.success('Verification successful!');
                navigate('/');
            } else {
                toast.error('Invalid OTP. Use 123456 for demo.');
            }
        }, 1500);
    };

    const handleResend = () => {
        if (timer > 0) return;
        setTimer(30);
        toast.success('New OTP sent successfully!');
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
            <div className="absolute inset-0 bg-black/30 z-0" />

            {/* Back Button */}
            <div className="absolute top-6 left-6 z-20">
                <button
                    onClick={() => navigate('/login')}
                    className="flex items-center gap-2 text-white/80 hover:text-white transition-all font-medium backdrop-blur-md bg-black/20 px-4 py-2 rounded-full hover:bg-black/30"
                >
                    <ArrowLeft size={18} />
                    <span>Back</span>
                </button>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-[450px] bg-white rounded-3xl shadow-2xl overflow-hidden relative z-10 p-8 md:p-10 text-center"
            >
                <div className="w-20 h-20 bg-[#2c5336]/10 rounded-full flex items-center justify-center mx-auto mb-8 border border-[#2c5336]/20">
                    <ShieldCheck size={40} className="text-[#2c5336]" />
                </div>

                <h1 className="text-2xl font-black text-gray-900 font-['Poppins'] mb-3 uppercase tracking-tight">Two-Step Verification</h1>
                <p className="text-gray-500 text-sm leading-relaxed mb-8">
                    We've sent a 6-digit verification code to <br />
                    <span className="font-bold text-[#2c5336]">{contactInfo}</span>
                </p>

                <form onSubmit={handleVerify} className="space-y-8">
                    <div className="flex justify-between gap-2 md:gap-3" onPaste={handlePaste}>
                        {otp.map((digit, index) => (
                            <input
                                key={index}
                                ref={el => inputRefs.current[index] = el}
                                type="text"
                                maxLength={1}
                                value={digit}
                                onChange={(e) => handleChange(index, e.target.value)}
                                onKeyDown={(e) => handleKeyDown(index, e)}
                                className="w-12 h-14 md:w-14 md:h-16 text-center text-xl font-black bg-gray-50 border-2 border-transparent rounded-xl focus:border-[#2c5336] focus:bg-white outline-none transition-all text-[#2c5336]"
                                autoFocus={index === 0}
                            />
                        ))}
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-[#2c5336] text-white font-black text-sm py-4 rounded-xl hover:bg-[#1f3b26] transition-all shadow-xl shadow-[#2c5336]/20 flex items-center justify-center gap-2 uppercase tracking-widest active:scale-95 disabled:opacity-70"
                    >
                        {isLoading ? (
                            <RefreshCw className="animate-spin" size={18} />
                        ) : (
                            'Verify & Proceed'
                        )}
                    </button>
                </form>

                <div className="mt-10 pt-8 border-t border-gray-100 italic">
                    <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-4">Didn't receive the code?</p>
                    <button
                        onClick={handleResend}
                        disabled={timer > 0}
                        className={`flex items-center gap-2 mx-auto font-black text-sm uppercase tracking-tighter ${timer > 0 ? 'text-gray-300 cursor-not-allowed' : 'text-[#2c5336] hover:underline'}`}
                    >
                        {timer > 0 ? `Resend available in ${timer}s` : 'Resend New Code'}
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

export default OTPPage;
