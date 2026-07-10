"use client";

import { useState } from "react";
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  ArrowLeft,
  CheckCircle2, 
  KeyRound,
  ShieldCheck
} from "lucide-react";
import { InputOTP, Label, Link } from "@heroui/react";

export default function ForgotPassword() {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [email, setEmail] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // ফর্ম সাবমিট হ্যান্ডলার (ডেমো ট্রানজিশন)
  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) setStep(2);
  };

  const handleOtpVerify = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(3);
  };

  const handlePasswordReset = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(4);
  };

  return (
    <div className="max-w-md w-full mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden font-sans my-20 border border-gray-100 p-8 sm:p-10 transition-all duration-300">
      
      {/* STEP 1: ENTER EMAIL */}
      {step === 1 && (
        <form onSubmit={handleEmailSubmit} className="animate-in fade-in duration-300">
          <div className="text-center mb-6">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <KeyRound size={24} />
            </div>
            <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">Forgot Password?</h2>
            <p className="text-gray-500 text-xs mt-1">No worries! Enter your email to receive a 6-digit OTP code.</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-sm text-gray-800 bg-gray-50/50 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-50 focus:border-blue-500 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 font-bold text-sm text-white py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-600/10 transition-all"
            >
              Send Verification Code
              <ArrowRight size={14} />
            </button>
          </div>

          <div className="text-center text-xs text-gray-500 mt-6">
            <a href="/login" className="inline-flex items-center gap-1 font-bold text-gray-600 hover:text-blue-600 hover:underline">
              <ArrowLeft size={12} /> Back to Sign In
            </a>
          </div>
        </form>
      )}

      {/* STEP 2: OTP VERIFICATION (Your Requested Component Integration) */}
      {step === 2 && (
        <form onSubmit={handleOtpVerify} className="animate-in fade-in duration-300">
          <div className="text-center mb-6">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <ShieldCheck size={24} />
            </div>
            <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">Security Check</h2>
          </div>

          {/* HeroUI OTP Integration with Layout Enhancements */}
          <div className="flex flex-col gap-4 items-center justify-center bg-gray-50/50 p-5 rounded-2xl border border-gray-100">
            <div className="flex flex-col gap-1 w-full text-center">
              <Label className="text-xs font-bold text-gray-700">Verify account</Label>
              <p className="text-xs text-gray-500">We&apos;ve sent a code to <span className="font-semibold text-gray-700">{email || "your email"}</span></p>
            </div>
            
            <InputOTP maxLength={6} className="gap-2">
              <InputOTP.Group>
                <InputOTP.Slot index={0} className="w-10 h-11 bg-white border border-gray-200 rounded-lg text-sm font-bold text-gray-800 focus:border-blue-500" />
                <InputOTP.Slot index={1} className="w-10 h-11 bg-white border border-gray-200 rounded-lg text-sm font-bold text-gray-800 focus:border-blue-500" />
                <InputOTP.Slot index={2} className="w-10 h-11 bg-white border border-gray-200 rounded-lg text-sm font-bold text-gray-800 focus:border-blue-500" />
              </InputOTP.Group>
              <InputOTP.Separator className="text-gray-300" />
              <InputOTP.Group>
                <InputOTP.Slot index={3} className="w-10 h-11 bg-white border border-gray-200 rounded-lg text-sm font-bold text-gray-800 focus:border-blue-500" />
                <InputOTP.Slot index={4} className="w-10 h-11 bg-white border border-gray-200 rounded-lg text-sm font-bold text-gray-800 focus:border-blue-500" />
                <InputOTP.Slot index={5} className="w-10 h-11 bg-white border border-gray-200 rounded-lg text-sm font-bold text-gray-800 focus:border-blue-500" />
              </InputOTP.Group>
            </InputOTP>

            <div className="flex items-center gap-[5px] pt-1">
              <p className="text-xs text-gray-500">Didn&apos;t receive a code?</p>
              <Link className="text-xs font-bold text-blue-600 underline cursor-pointer" href="#">
                Resend
              </Link>
            </div>
          </div>

          <div className="space-y-3 mt-5">
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 font-bold text-sm text-white py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 shadow-md transition-all"
            >
              Verify Code
              <ArrowRight size={14} />
            </button>
            <button
              type="button"
              onClick={() => setStep(1)}
              className="w-full text-center text-xs text-gray-500 font-medium hover:text-gray-800 transition-colors py-1"
            >
              Change Email Address
            </button>
          </div>
        </form>
      )}

      {/* STEP 3: RESET PASSWORD */}
      {step === 3 && (
        <form onSubmit={handlePasswordReset} className="animate-in fade-in duration-300">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">New Password</h2>
            <p className="text-gray-500 text-xs mt-1">Please enter your secure strong password.</p>
          </div>

          <div className="space-y-4">
            {/* New Password */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">New Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  className="w-full pl-9 pr-10 py-2 text-sm text-gray-800 bg-gray-50/50 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-50 focus:border-blue-500 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Confirm New Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  className="w-full pl-9 pr-10 py-2 text-sm text-gray-800 bg-gray-50/50 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-50 focus:border-blue-500 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                >
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 font-bold text-sm text-white py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 shadow-md transition-all"
            >
              Reset Password
              <ArrowRight size={14} />
            </button>
          </div>
        </form>
      )}

      {/* STEP 4: SUCCESS */}
      {step === 4 && (
        <div className="text-center py-4 animate-in fade-in duration-300">
          <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 size={36} />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Password Reset!</h2>
          <p className="text-gray-600 text-sm mb-6">
            Your account password has been updated successfully. You can now log in securely.
          </p>
          <a
            href="/login"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2.5 rounded-xl transition-all shadow-lg text-sm w-full"
          >
            Proceed to Login
          </a>
        </div>
      )}

    </div>
  );
}