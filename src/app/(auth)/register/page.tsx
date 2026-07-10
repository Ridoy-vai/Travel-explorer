"use client";

import { useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { 
  User, 
  Building, 
  Mail, 
  Lock, 
  Phone, 
  FileText, 
  Globe, 
  ArrowRight, 
  CheckCircle2,
  Compass,
  MapPin,
  Eye,
  EyeOff
} from "lucide-react";
import { 
  FaGoogle, 
  FaFacebookF, 
  FaInstagram, 
  FaTwitter, 
  FaTiktok 
} from "react-icons/fa";

interface IRegisterInput {
  role: "traveler" | "agency";
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  terms: boolean;
  fullName?: string;
  agencyName?: string;
  tradeLicense?: string;
  operatingRegion?: string;
}

export default function RegisterForm() {
  const [userRole, setUserRole] = useState<"traveler" | "agency">("traveler");
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  // পাসওয়ার্ড শো/হাইড করার জন্য দুটি আলাদা স্টেট
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<IRegisterInput>({
    defaultValues: {
      role: "traveler",
      terms: false,
    },
  });

  const passwordValue = watch("password");

  const onSubmit: SubmitHandler<IRegisterInput> = async (data) => {
    console.log("Registration Core Data:", { ...data, role: userRole });
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsSubmitted(true);
  };

  const handleRoleChange = (role: "traveler" | "agency") => {
    setUserRole(role);
    reset({ role: role, terms: false, password: "", confirmPassword: "", email: "", phone: "" });
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  if (isSubmitted) {
    return (
      <div className="max-w-md w-full mx-auto bg-white p-8 rounded-2xl shadow-2xl border border-gray-100 text-center py-12 my-20 animate-in fade-in duration-300">
        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 size={36} />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Registration Complete!</h2>
        <p className="text-gray-600 text-sm mb-6">
          {userRole === "traveler" 
            ? "Account created successfully. Welcome to your ultimate Bangladesh travel companion!"
            : "Your business request is registered. Our admin panel will review your Trade License shortly."}
        </p>
        <button 
          onClick={() => { setIsSubmitted(false); reset(); }}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2.5 rounded-xl transition-all shadow-lg"
        >
          Proceed to Login
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl w-full mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden font-sans my-10 border border-gray-100">
      
      {/* Outer Grid Wrapper */}
      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-12 min-h-[680px]">
        
        {/* ==================== LEFT GRID: ACCOUNT ESSENTIALS ==================== */}
        <div className="lg:col-span-5 p-6 sm:p-10 flex flex-col justify-between bg-white">
          <div>
            {/* Form Title */}
            <div className="mb-6">
              <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">Create Account</h2>
              <p className="text-gray-500 text-xs mt-1">Enter your credentials to get started</p>
            </div>

            {/* Role Selection Tabs */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-gray-100 rounded-xl mb-5">
              <button
                type="button"
                onClick={() => handleRoleChange("traveler")}
                className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-all ${
                  userRole === "traveler" ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-800"
                }`}
              >
                <User size={16} /> Traveler
              </button>
              <button
                type="button"
                onClick={() => handleRoleChange("agency")}
                className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-all ${
                  userRole === "agency" ? "bg-white text-orange-600 shadow-sm" : "text-gray-500 hover:text-gray-800"
                }`}
              >
                <Building size={16} /> Business Agency
              </button>
            </div>

            {/* Credentials Input Stack */}
            <div className="space-y-3.5">
              {/* Email Address */}
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
                    className={`w-full pl-9 pr-4 py-2 text-sm text-gray-800 bg-gray-50/50 rounded-xl border focus:outline-none focus:ring-2 transition-all ${
                      errors.email ? "border-red-400 focus:ring-red-100" : "border-gray-200 focus:ring-blue-50 focus:border-blue-500"
                    }`}
                  />
                </div>
                {errors.email && <p className="text-red-500 text-[11px] mt-0.5 font-medium">{errors.email.message}</p>}
              </div>

              {/* WhatsApp Number */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  WhatsApp Number <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    type="tel"
                    placeholder="+880 17XX XXXXXX"
                    {...register("phone", {
                      required: "WhatsApp number is required",
                      minLength: { value: 11, message: "Minimum 11 digits required" }
                    })}
                    className={`w-full pl-9 pr-4 py-2 text-sm text-gray-800 bg-gray-50/50 rounded-xl border focus:outline-none focus:ring-2 transition-all ${
                      errors.phone ? "border-red-400 focus:ring-red-100" : "border-gray-200 focus:ring-blue-50 focus:border-blue-500"
                    }`}
                  />
                </div>
                {errors.phone && <p className="text-red-500 text-[11px] mt-0.5 font-medium">{errors.phone.message}</p>}
              </div>

              {/* Password with Eye Toggle */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    {...register("password", {
                      required: "Password is required",
                      minLength: { value: 6, message: "Must be at least 6 characters" }
                    })}
                    className={`w-full pl-9 pr-10 py-2 text-sm text-gray-800 bg-gray-50/50 rounded-xl border focus:outline-none focus:ring-2 transition-all ${
                      errors.password ? "border-red-400 focus:ring-red-100" : "border-gray-200 focus:ring-blue-50 focus:border-blue-500"
                    }`}
                  />
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

              {/* Confirm Password with Eye Toggle */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Confirm Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    {...register("confirmPassword", {
                      required: "Confirmation required",
                      validate: (value) => value === passwordValue || "Passwords do not match"
                    })}
                    className={`w-full pl-9 pr-10 py-2 text-sm text-gray-800 bg-gray-50/50 rounded-xl border focus:outline-none focus:ring-2 transition-all ${
                      errors.confirmPassword ? "border-red-400 focus:ring-red-100" : "border-gray-200 focus:ring-blue-50 focus:border-blue-500"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                  >
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.confirmPassword && <p className="text-red-500 text-[11px] mt-0.5 font-medium">{errors.confirmPassword.message}</p>}
              </div>
            </div>
          </div>

          {/* Bottom Actions Footer */}
          <div className="mt-5 pt-3 border-t border-gray-100">
            <label className="flex items-start gap-2 cursor-pointer select-none mb-3">
              <input
                type="checkbox"
                {...register("terms", { required: "Accepting Terms is required" })}
                className="mt-0.5 h-3.5 w-3.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-[11px] text-gray-500 leading-tight">
                I accept the <span className="text-blue-600 font-semibold hover:underline">Terms of Service</span> & community guidelines.
              </span>
            </label>
            {errors.terms && <p className="text-red-500 text-[11px] mb-2 font-medium">{errors.terms.message}</p>}

            {/* Main Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full flex items-center justify-center gap-2 font-bold text-sm text-white py-2.5 px-4 rounded-xl shadow-md transition-all ${
                userRole === "traveler" ? "bg-blue-600 hover:bg-blue-700 shadow-blue-600/10" : "bg-orange-500 hover:bg-orange-600 shadow-orange-500/10"
              } disabled:opacity-50`}
            >
              {isSubmitting ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <>
                  Register Account
                  <ArrowRight size={14} />
                </>
              )}
            </button>

            {/* Divider */}
            <div className="relative my-4 text-center">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-100" /></div>
              <span className="relative bg-white px-3 text-[10px] font-bold tracking-wider text-gray-400 uppercase">Or Register With</span>
            </div>

            {/* 5 Social Sign-Up Icons Grid */}
            <div className="grid grid-cols-5 gap-2">
              <button type="button" aria-label="Sign up with Google" className="flex items-center justify-center py-2 rounded-xl border border-gray-100 hover:bg-red-50 text-gray-600 hover:text-red-500 hover:border-red-200 transition-all group">
                <FaGoogle size={14} className="group-hover:scale-110 transition-transform" />
              </button>
              <button type="button" aria-label="Sign up with Facebook" className="flex items-center justify-center py-2 rounded-xl border border-gray-100 hover:bg-blue-50 text-gray-600 hover:text-blue-600 hover:border-blue-200 transition-all group">
                <FaFacebookF size={14} className="group-hover:scale-110 transition-transform" />
              </button>
              <button type="button" aria-label="Sign up with Instagram" className="flex items-center justify-center py-2 rounded-xl border border-gray-100 hover:bg-pink-50 text-gray-600 hover:text-pink-600 hover:border-pink-200 transition-all group">
                <FaInstagram size={14} className="group-hover:scale-110 transition-transform" />
              </button>
              <button type="button" aria-label="Sign up with Twitter" className="flex items-center justify-center py-2 rounded-xl border border-gray-100 hover:bg-slate-50 text-gray-600 hover:text-slate-900 hover:border-slate-300 transition-all group">
                <FaTwitter size={14} className="group-hover:scale-110 transition-transform" />
              </button>
              <button type="button" aria-label="Sign up with TikTok" className="flex items-center justify-center py-2 rounded-xl border border-gray-100 hover:bg-cyan-50 text-gray-600 hover:text-black hover:border-black/20 transition-all group">
                <FaTiktok size={14} className="group-hover:scale-110 transition-transform" />
              </button>
            </div>

            {/* Sign In Link Prompt */}
            <div className="text-center text-xs text-gray-500 mt-4">
              Already have an account?{" "}
              <a href="/login" className="text-blue-600 font-bold hover:underline">Sign In</a>
            </div>
          </div>
        </div>

        {/* ==================== RIGHT GRID: DYNAMIC PROFILE DETAILS & VISUALS ==================== */}
        <div className="lg:col-span-7 relative flex flex-col justify-between p-6 sm:p-10 bg-slate-950 text-white min-h-[400px] lg:min-h-full">
          
          {/* Dynamic Background Image Layers matching the Role Context */}
          <div className="absolute inset-0 z-0">
            <div 
              className={`absolute inset-0 bg-cover bg-center transition-all duration-700 ease-in-out ${
                userRole === "traveler" ? "opacity-40 scale-100" : "opacity-0 scale-95"
              }`}
              style={{ backgroundImage: "linear-gradient(to top, #020617 30%, transparent), url('https://images.unsplash.com/photo-1628155930542-3c7a64e2c833?auto=format&fit=crop&w=1000&q=80')" }} 
            />
            <div 
              className={`absolute inset-0 bg-cover bg-center transition-all duration-700 ease-in-out ${
                userRole === "agency" ? "opacity-40 scale-100" : "opacity-0 scale-95"
              }`}
              style={{ backgroundImage: "linear-gradient(to top, #020617 30%, transparent), url('https://images.unsplash.com/photo-1583212292454-1fe6229603b7?auto=format&fit=crop&w=1000&q=80')" }} 
            />
            {/* Mesh pattern grid blur */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_20%,#020617_80%)]" />
          </div>

          {/* Right Header Text Content */}
          <div className="relative z-10 max-w-md">
            <div className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-md px-2.5 py-1 rounded-full text-xs text-sky-400 font-semibold mb-3 border border-white/10">
              <Compass size={12} className="animate-spin duration-1000" />
              <span>{userRole === "traveler" ? "Explore Horizon" : "B2B Marketplace"}</span>
            </div>
            
            <h3 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white leading-tight">
              {userRole === "traveler" 
                ? "Unlock the wonders of breathtaking Bangladesh." 
                : "Empower your local tourism business ecosystem."}
            </h3>
            <p className="text-slate-300 text-xs mt-2 leading-relaxed">
              {userRole === "traveler"
                ? "Join thousands of explorers. Create customized rosters for Cox's Bazar beaches, Sajek valleys, and deep Sundarban tracking lines."
                : "Gain instant verification badges, upload multi-day packages, handle payouts directly, and track traveler reviews via an integrated dashboard."}
            </p>
          </div>

          {/* MIDDLE ASPECT: FLOATING GLASSMORPHIC FORM CARD */}
          <div className="relative z-10 my-6 max-w-md w-full bg-white/10 backdrop-blur-xl rounded-2xl p-5 border border-white/15 shadow-[0_20px_50px_rgba(0,0,0,0.3)] animate-in slide-in-from-right-4 duration-300">
            <h4 className="text-xs font-bold tracking-wider text-slate-300 uppercase mb-4 flex items-center gap-1.5 border-b border-white/10 pb-2">
              <MapPin size={12} className="text-orange-400" />
              Profile Customization Details
            </h4>

            {/* Dynamic Rendering Conditions */}
            {userRole === "traveler" ? (
              <div className="space-y-3 animate-in fade-in duration-200">
                <div>
                  <label className="block text-[11px] font-bold text-slate-200 mb-1">
                    Your Full Name <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                    <input
                      type="text"
                      placeholder="e.g. Tanvir Rahman"
                      {...register("fullName", { required: "Full name is required for profile" })}
                      className="w-full pl-9 pr-4 py-2 text-sm text-white bg-slate-900/40 border border-white/10 rounded-xl placeholder-slate-400 focus:outline-none focus:border-blue-400 transition-all"
                    />
                  </div>
                  {errors.fullName && <p className="text-red-400 text-[11px] mt-0.5 font-medium">{errors.fullName.message}</p>}
                </div>
              </div>
            ) : (
              <div className="space-y-3.5 animate-in fade-in duration-200">
                {/* Agency Name */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-200 mb-1">
                    Agency/Company Name <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <Building className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                    <input
                      type="text"
                      placeholder="e.g. Bengal Tours Ltd."
                      {...register("agencyName", { required: "Company name is required" })}
                      className="w-full pl-9 pr-4 py-2 text-sm text-white bg-slate-900/40 border border-white/10 rounded-xl placeholder-slate-400 focus:outline-none focus:border-orange-400 transition-all"
                    />
                  </div>
                  {errors.agencyName && <p className="text-red-400 text-[11px] mt-0.5 font-medium">{errors.agencyName.message}</p>}
                </div>

                {/* Trade License */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-200 mb-1">
                    Trade License Number <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                    <input
                      type="text"
                      placeholder="TRAD/DNCC/XXXXXX/2026"
                      {...register("tradeLicense", { required: "Trade license number is mandatory" })}
                      className="w-full pl-9 pr-4 py-2 text-sm text-white bg-slate-900/40 border border-white/10 rounded-xl placeholder-slate-400 focus:outline-none focus:border-orange-400 transition-all"
                    />
                  </div>
                  {errors.tradeLicense && <p className="text-red-400 text-[11px] mt-0.5 font-medium">{errors.tradeLicense.message}</p>}
                </div>

                {/* Operating Region */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-200 mb-1">
                    Operating Jurisdiction / Region <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                    <input
                      type="text"
                      placeholder="e.g. Dhaka, Sylhet, Chittagong"
                      {...register("operatingRegion", { required: "Operating zone is required" })}
                      className="w-full pl-9 pr-4 py-2 text-sm text-white bg-slate-900/40 border border-white/10 rounded-xl placeholder-slate-400 focus:outline-none focus:border-orange-400 transition-all"
                    />
                  </div>
                  {errors.operatingRegion && <p className="text-red-400 text-[11px] mt-0.5 font-medium">{errors.operatingRegion.message}</p>}
                </div>
              </div>
            )}
          </div>

          {/* Small Footer Branding on Right Column */}
          <div className="relative z-10 text-slate-400 text-[10px] tracking-wide mt-2">
            © 2026 Travel Buddies Ecosystem. Secure SSL Encrypted Hub.
          </div>
          
        </div>
      </form>
    </div>
  );
}