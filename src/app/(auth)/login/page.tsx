"use client";
import Link from "next/link";
import { useState, FormEvent } from "react";
import {
    Mail,
    Lock,
    Eye,
    EyeOff,
    ArrowRight,
    Compass,
    MapPin,
    Calendar
} from "lucide-react";
import {
    FaGoogle,
    FaFacebookF,
    FaInstagram,
    FaTwitter,
    FaTiktok
} from "react-icons/fa";
import { authClient } from "@/lib/auth-client";
import { toast } from "react-toastify";

export default function LoginForm() {
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [rememberMe, setRememberMe] = useState<boolean>(false);
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

    const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
        // ফর্মের ডিফল্ট রিলোড বিহেভিয়ার বন্ধ করার জন্য
        e.preventDefault();

        if (!email || !password) {
            toast.error("Please fill in all fields.");
            return;
        }

        setIsSubmitting(true);
        console.log("Login Requested Data:", { email, password, rememberMe });

        try {
            const { data: loginData, error } = await authClient.signIn.email({
                email,
                password,
                rememberMe: true,
                callbackURL: "/",
            });

            console.log("Login response:", { loginData, error }); // debug

            if (error) {
                if (error.status === 403) {
                   
                    toast.error(
                        <div>
                            Email not verified.
                            <button
                                type="button"
                                onClick={async () => {
                                    await authClient.sendVerificationEmail({
                                        email,
                                        callbackURL: "/",
                                    });
                                    toast.info("Verification email resent!");
                                }}
                                className="ml-2 underline font-bold"
                            >
                                Resend
                            </button>
                        </div>,
                        { autoClose: 8000 }
                    );
                } else {
                    toast.error(error.message || "Login failed. Please check your credentials.");
                }
                return;
            }

            toast.success("Logged in successfully!");
            // router.push("/");

        } catch (err) {
            console.error("Unexpected login error:", err);
            toast.error("Something went wrong. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-5xl w-full mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden font-sans my-10 border border-gray-100">

            {/* Main Container Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 min-h-170">

                {/* ==================== LEFT GRID: CREDENTIALS & SOCIAL LOGINS ==================== */}
                <div className="lg:col-span-5 p-6 sm:p-10 flex flex-col justify-between bg-white">
                    <div>
                        {/* Header Title */}
                        <div className="mb-6">
                            <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">Welcome Back</h2>
                            <p className="text-gray-500 text-xs mt-1">Sign in to continue your adventure</p>
                        </div>

                        {/* Login Credentials Inputs Form */}
                        <form onSubmit={handleLogin} className="space-y-4">
                            {/* Email Input */}
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1">
                                    Email Address <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                    <input
                                        type="email"
                                        placeholder="name@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full pl-9 pr-4 py-2 text-sm text-gray-800 bg-gray-50/50 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-50 focus:border-blue-500 transition-all"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Password Input with Visibility Toggle */}
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1">
                                    Password <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full pl-9 pr-10 py-2 text-sm text-gray-800 bg-gray-50/50 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-50 focus:border-blue-500 transition-all"
                                        required
                                    />
                                    {/* Show/Hide Password Toggle Icon Button */}
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                                    >
                                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>

                            {/* Remember Me & Forget Password Section */}
                            <div className="flex items-center justify-between pt-1 text-[11px]">
                                <label className="flex items-center gap-1.5 cursor-pointer text-gray-600 select-none">
                                    <input
                                        type="checkbox"
                                        checked={rememberMe}
                                        onChange={(e) => setRememberMe(e.target.checked)}
                                        className="h-3.5 w-3.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    Remember me
                                </label>
                                <Link href="/ForgotPassword" className="text-blue-600 font-semibold hover:underline">Forgot Password?</Link>
                            </div>

                            {/* Main Submit Login Button */}
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full mt-2 flex items-center justify-center gap-2 font-bold text-sm text-white py-2.5 px-4 rounded-xl shadow-md bg-blue-600 hover:bg-blue-700 shadow-blue-600/10 disabled:opacity-50 transition-all"
                            >
                                {isSubmitting ? (
                                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                ) : (
                                    <>
                                        Sign In
                                        <ArrowRight size={14} />
                                    </>
                                )}
                            </button>
                        </form>

                        {/* Divider */}
                        <div className="relative my-5 text-center">
                            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-100" /></div>
                            <span className="relative bg-white px-3 text-[10px] font-bold tracking-wider text-gray-400 uppercase">Or Connect With</span>
                        </div>

                        {/* Social Logins */}
                        <div className="grid grid-cols-5 gap-2">
                            <button type="button" aria-label="Login with Google" className="flex items-center justify-center py-2.5 rounded-xl border border-gray-100 hover:bg-red-50 text-gray-600 hover:text-red-500 hover:border-red-200 transition-all group">
                                <FaGoogle size={16} className="group-hover:scale-110 transition-transform" />
                            </button>
                            <button type="button" aria-label="Login with Facebook" className="flex items-center justify-center py-2.5 rounded-xl border border-gray-100 hover:bg-blue-50 text-gray-600 hover:text-blue-600 hover:border-blue-200 transition-all group">
                                <FaFacebookF size={16} className="group-hover:scale-110 transition-transform" />
                            </button>
                            <button type="button" aria-label="Login with Instagram" className="flex items-center justify-center py-2.5 rounded-xl border border-gray-100 hover:bg-pink-50 text-gray-600 hover:text-pink-600 hover:border-pink-200 transition-all group">
                                <FaInstagram size={16} className="group-hover:scale-110 transition-transform" />
                            </button>
                            <button type="button" aria-label="Login with Twitter" className="flex items-center justify-center py-2.5 rounded-xl border border-gray-100 hover:bg-slate-50 text-gray-600 hover:text-slate-900 hover:border-slate-300 transition-all group">
                                <FaTwitter size={16} className="group-hover:scale-110 transition-transform" />
                            </button>
                            <button type="button" aria-label="Login with TikTok" className="flex items-center justify-center py-2.5 rounded-xl border border-gray-100 hover:bg-cyan-50 text-gray-600 hover:text-black hover:border-black/20 transition-all group">
                                <FaTiktok size={16} className="group-hover:scale-110 transition-transform" />
                            </button>
                        </div>
                    </div>

                    {/* Prompt Sign up link */}
                    <div className="text-center text-xs text-gray-500 pt-6 border-t border-gray-100 mt-6">
                        Dont have an account?{" "}
                        <Link href="/register" className="text-blue-600 font-bold hover:underline">Create Account</Link>
                    </div>
                </div>

                {/* ==================== RIGHT GRID: BACKGROUND & GLASSMORPHIC PREVIEWS ==================== */}
                <div className="lg:col-span-7 relative flex flex-col justify-between p-6 sm:p-10 bg-slate-950 text-white min-h-[400px] lg:min-h-full">

                    {/* Fixed Beautiful Background Layout Image */}
                    <div className="absolute inset-0 z-0">
                        <div
                            className="absolute inset-0 bg-cover bg-center opacity-35"
                            style={{ backgroundImage: "linear-gradient(to top, #020617 30%, transparent), url('https://images.unsplash.com/photo-1599930113854-d6d7fd521f10?auto=format&fit=crop&w=1000&q=80')" }}
                        />
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_10%,#020617_85%)]" />
                    </div>

                    {/* Right Section Sub-header */}
                    <div className="relative z-10 max-w-md">
                        <div className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-md px-2.5 py-1 rounded-full text-xs text-amber-400 font-semibold mb-3 border border-white/10">
                            <Compass className="animate-spin" style={{ animationDuration: '3s' }} size={12} />
                            <span>Traveler Hub Log</span>
                        </div>
                        <h3 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white leading-tight">
                            Your customized itineraries are waiting.
                        </h3>
                    </div>

                    {/* FLOATING GLASSMORPHIC STATS WIDGET PANEL */}
                    <div className="relative z-10 my-6 max-w-sm w-full bg-white/10 backdrop-blur-xl rounded-2xl p-5 border border-white/15 shadow-[0_20px_50px_rgba(0,0,0,0.4)]">
                        <div className="space-y-4">
                            <div className="flex items-center justify-between border-b border-white/10 pb-2">
                                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1">
                                    <MapPin className="text-blue-400" size={12} /> Current Next Route
                                </h4>
                                <span className="text-[10px] bg-blue-500/30 text-blue-300 font-bold px-2 py-0.5 rounded-full">Active Plan</span>
                            </div>
                            <div className="flex gap-3">
                                <div className="h-12 w-12 rounded-xl bg-cover bg-center shrink-0 border border-white/10" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1628155930542-3c7a64e2c833?auto=format&fit=crop&w=150&q=80')" }} />
                                <div>
                                    <h5 className="text-sm font-bold text-white">Sajek Cloud Fest 2026</h5>
                                    <p className="text-[11px] text-slate-300 flex items-center gap-1 mt-0.5"><Calendar size={10} /> Jan 24 - Jan 27</p>
                                </div>
                            </div>
                            <div className="bg-slate-950/40 rounded-xl p-2.5 border border-white/5 flex justify-between text-center">
                                <div><p className="text-[10px] text-slate-400">Total Booked</p><p className="text-xs font-bold text-white">04 Trips</p></div>
                                <div className="border-l border-white/10 pl-3"><div><p className="text-[10px] text-slate-400">Loyalty Level</p><p className="text-xs font-bold text-amber-400">Gold Buddy ⭐</p></div></div>
                            </div>
                        </div>
                    </div>

                    {/* Footer Copyright */}
                    <div className="relative z-10 text-slate-400 text-[10px] tracking-wide">
                        © 2026 Travel Buddies Ecosystem. Secure 256-bit Login Endpoint.
                    </div>

                </div>
            </div>
        </div>
    );
}