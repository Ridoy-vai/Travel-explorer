"use client";
import Link from "next/link";
import { useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import {
    User,
    Building,
    Mail,
    Lock,
    Eye,
    EyeOff,
    ArrowRight,
    Compass,
    TrendingUp,
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

interface ILoginInput {
    role: "traveler" | "agency";
    email: string;
    password: string;
    rememberMe: boolean;
}

export default function LoginForm() {
    const [userRole, setUserRole] = useState<"traveler" | "agency">("traveler");
    const [showPassword, setShowPassword] = useState<boolean>(false);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<ILoginInput>({
        defaultValues: {
            role: "traveler",
            rememberMe: false,
        },
    });

    const onSubmit: SubmitHandler<ILoginInput> = async (data) => {
        console.log("Login Requested Data:", { ...data, role: userRole });
        // API Call Simulate
        await new Promise((resolve) => setTimeout(resolve, 1200));
        alert(`Logged in successfully as ${userRole === "traveler" ? "Traveler" : "Agency"}!`);
    };

    return (
        <div className="max-w-5xl w-full mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden font-sans my-10 border border-gray-100">

            {/* Main Container Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[680px]">

                {/* ==================== LEFT GRID: CREDENTIALS & SOCIAL LOGINS ==================== */}
                <div className="lg:col-span-5 p-6 sm:p-10 flex flex-col justify-between bg-white">
                    <div>
                        {/* Header Title */}
                        <div className="mb-6">
                            <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">Welcome Back</h2>
                            <p className="text-gray-500 text-xs mt-1">Sign in to continue your adventure</p>
                        </div>

                        {/* Role Selection Tabs */}
                        <div className="grid grid-cols-2 gap-2 p-1 bg-gray-100 rounded-xl mb-5">
                            <button
                                type="button"
                                onClick={() => setUserRole("traveler")}
                                className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-all ${userRole === "traveler" ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-800"
                                    }`}
                            >
                                <User size={16} /> Traveler
                            </button>
                            <button
                                type="button"
                                onClick={() => setUserRole("agency")}
                                className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-all ${userRole === "agency" ? "bg-white text-orange-600 shadow-sm" : "text-gray-500 hover:text-gray-800"
                                    }`}
                            >
                                <Building size={16} /> Business Agency
                            </button>
                        </div>

                        {/* Login Credentials Inputs Form */}
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
                                        {...register("email", {
                                            required: "Email is required",
                                            pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, message: "Invalid email" }
                                        })}
                                        className={`w-full pl-9 pr-4 py-2 text-sm text-gray-800 bg-gray-50/50 rounded-xl border focus:outline-none focus:ring-2 transition-all ${errors.email ? "border-red-400 focus:ring-red-100" : "border-gray-200 focus:ring-blue-50 focus:border-blue-500"
                                            }`}
                                    />
                                </div>
                                {errors.email && <p className="text-red-500 text-[11px] mt-0.5 font-medium">{errors.email.message}</p>}
                            </div>

                            {/* Password Input with Visibility Toggle Toggle */}
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1">
                                    Password <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        placeholder="••••••••"
                                        {...register("password", { required: "Password is required" })}
                                        className={`w-full pl-9 pr-10 py-2 text-sm text-gray-800 bg-gray-50/50 rounded-xl border focus:outline-none focus:ring-2 transition-all ${errors.password ? "border-red-400 focus:ring-red-100" : "border-gray-200 focus:ring-blue-50 focus:border-blue-500"
                                            }`}
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
                                {errors.password && <p className="text-red-500 text-[11px] mt-0.5 font-medium">{errors.password.message}</p>}
                            </div>

                            {/* Remember Me & Forget Password Section */}
                            <div className="flex items-center justify-between pt-1 text-[11px]">
                                <label className="flex items-center gap-1.5 cursor-pointer text-gray-600 select-none">
                                    <input
                                        type="checkbox"
                                        {...register("rememberMe")}
                                        className="h-3.5 w-3.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    Remember me
                                </label>
                                <Link href="ForgotPassword" className="text-blue-600 font-semibold hover:underline">Forgot Password?</Link>
                            </div>

                            {/* Main Submit Login Button */}
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className={`w-full mt-2 flex items-center justify-center gap-2 font-bold text-sm text-white py-2.5 px-4 rounded-xl shadow-md transition-all ${userRole === "traveler" ? "bg-blue-600 hover:bg-blue-700 shadow-blue-600/10" : "bg-orange-500 hover:bg-orange-600 shadow-orange-500/10"
                                    } disabled:opacity-50`}
                            >
                                {isSubmitting ? (
                                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                ) : (
                                    <>
                                        Sign In as {userRole === "traveler" ? "Traveler" : "Agency"}
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

                        {/* ==================== 5 SOCIAL LOGINS ROW GRID ==================== */}
                        <div className="grid grid-cols-5 gap-2">
                            {/* Google */}
                            <button type="button" aria-label="Login with Google" className="flex items-center justify-center py-2.5 rounded-xl border border-gray-100 hover:bg-red-50 text-gray-600 hover:text-red-500 hover:border-red-200 transition-all group">
                                <FaGoogle size={16} className="group-hover:scale-110 transition-transform" />
                            </button>
                            {/* Facebook */}
                            <button type="button" aria-label="Login with Facebook" className="flex items-center justify-center py-2.5 rounded-xl border border-gray-100 hover:bg-blue-50 text-gray-600 hover:text-blue-600 hover:border-blue-200 transition-all group">
                                <FaFacebookF size={16} className="group-hover:scale-110 transition-transform" />
                            </button>
                            {/* Instagram */}
                            <button type="button" aria-label="Login with Instagram" className="flex items-center justify-center py-2.5 rounded-xl border border-gray-100 hover:bg-pink-50 text-gray-600 hover:text-pink-600 hover:border-pink-200 transition-all group">
                                <FaInstagram size={16} className="group-hover:scale-110 transition-transform" />
                            </button>
                            {/* Twitter / X */}
                            <button type="button" aria-label="Login with Twitter" className="flex items-center justify-center py-2.5 rounded-xl border border-gray-100 hover:bg-slate-50 text-gray-600 hover:text-slate-900 hover:border-slate-300 transition-all group">
                                <FaTwitter size={16} className="group-hover:scale-110 transition-transform" />
                            </button>
                            {/* TikTok */}
                            <button type="button" aria-label="Login with TikTok" className="flex items-center justify-center py-2.5 rounded-xl border border-gray-100 hover:bg-cyan-50 text-gray-600 hover:text-black hover:border-black/20 transition-all group">
                                <FaTiktok size={16} className="group-hover:scale-110 transition-transform" />
                            </button>
                        </div>
                    </div>

                    {/* Prompt Sign up link */}
                    <div className="text-center text-xs text-gray-500 pt-6 border-t border-gray-100 mt-6">
                        Don't have an account?{" "}
                        <a href="/register" className="text-blue-600 font-bold hover:underline">Create Account</a>
                    </div>
                </div>

                {/* ==================== RIGHT GRID: BACKGROUND & GLASSMORPHIC PREVIEWS ==================== */}
                <div className="lg:col-span-7 relative flex flex-col justify-between p-6 sm:p-10 bg-slate-950 text-white min-h-[400px] lg:min-h-full">

                    {/* Dynamic Background Layout Images matching Register Form */}
                    <div className="absolute inset-0 z-0">
                        <div
                            className={`absolute inset-0 bg-cover bg-center transition-all duration-700 ease-in-out ${userRole === "traveler" ? "opacity-35 scale-100" : "opacity-0 scale-95"
                                }`}
                            style={{ backgroundImage: "linear-gradient(to top, #020617 30%, transparent), url('https://images.unsplash.com/photo-1599930113854-d6d7fd521f10?auto=format&fit=crop&w=1000&q=80')" }}
                        />
                        <div
                            className={`absolute inset-0 bg-cover bg-center transition-all duration-700 ease-in-out ${userRole === "agency" ? "opacity-35 scale-100" : "opacity-0 scale-95"
                                }`}
                            style={{ backgroundImage: "linear-gradient(to top, #020617 30%, transparent), url('https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1000&q=80')" }}
                        />
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_10%,#020617_85%)]" />
                    </div>

                    {/* Right Section Sub-header */}
                    <div className="relative z-10 max-w-md">
                        <div className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-md px-2.5 py-1 rounded-full text-xs text-amber-400 font-semibold mb-3 border border-white/10">
                            <Compass size={12} className="animate-spin" style={{ animationDuration: '3s' }} />
                            <span>{userRole === "traveler" ? "Traveler Hub Log" : "Agency Console"}</span>
                        </div>

                        <h3 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white leading-tight">
                            {userRole === "traveler"
                                ? "Your customized itineraries are waiting."
                                : "Manage your travel packages and payouts."}
                        </h3>
                    </div>

                    {/* FLOATING GLASSMORPHIC STATS WIDGET PANEL (Real Project Vibe) */}
                    <div className="relative z-10 my-6 max-w-sm w-full bg-white/10 backdrop-blur-xl rounded-2xl p-5 border border-white/15 shadow-[0_20px_50px_rgba(0,0,0,0.4)] animate-in slide-in-from-right-5 duration-300">

                        {userRole === "traveler" ? (
                            /* Traveler Mockup Info Widget */
                            <div className="space-y-4 animate-in fade-in duration-200">
                                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1">
                                        <MapPin size={12} className="text-blue-400" /> Current Next Route
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
                        ) : (
                            /* Agency Dashboard Mockup Info Widget */
                            <div className="space-y-4 animate-in fade-in duration-200">
                                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1">
                                        <TrendingUp size={12} className="text-orange-400" /> Business Pulse
                                    </h4>
                                    <span className="text-[10px] bg-green-500/30 text-green-300 font-bold px-2 py-0.5 rounded-full">Live Analytics</span>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="bg-slate-950/30 rounded-xl p-3 border border-white/5">
                                        <p className="text-[10px] text-slate-400">Monthly Revenue</p>
                                        <p className="text-base font-extrabold text-white mt-0.5">৳ 1,42,000</p>
                                        <span className="text-[9px] text-green-400 font-medium">↑ 12% vs last month</span>
                                    </div>
                                    <div className="bg-slate-950/30 rounded-xl p-3 border border-white/5">
                                        <p className="text-[10px] text-slate-400">Active Bookings</p>
                                        <p className="text-base font-extrabold text-white mt-0.5">48 Travelers</p>
                                        <span className="text-[9px] text-orange-400 font-medium">9 Packages Listed</span>
                                    </div>
                                </div>
                            </div>
                        )}
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