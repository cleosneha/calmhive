"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { verifyOTP, resendOTP } from "@/actions/auth/otp";
import { toast } from "sonner";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function VerifyEmailClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";

  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);

  // Handle OTP submission
  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast.error("Email not found. Please register again.");
      return;
    }

    if (otp.length !== 6) {
      toast.error("Please enter a valid 6-digit OTP");
      return;
    }

    setIsLoading(true);

    try {
      const result = await verifyOTP(email, otp);

      if ("error" in result) {
        toast.error(result.error || "Failed to verify OTP");
      } else {
        toast.success("✓ Email verified successfully!");
        setTimeout(() => {
          router.push("/login");
        }, 2000);
      }
    } catch {
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle resend OTP
  const handleResendOTP = async () => {
    setIsResending(true);
    try {
      const result = await resendOTP(email);
      if ("error" in result) {
        toast.error(result.error || "Failed to resend OTP");
      } else {
        toast.success(result.message || "OTP sent successfully to your email");
        setOtp("");
      }
    } catch {
      toast.error("Failed to resend OTP");
    } finally {
      setIsResending(false);
    }
  };

  if (!email) {
    return (
      <div className="flex flex-col md:flex-row min-h-screen bg-white relative">
        {/* Left Section - Verify OTP Image (Desktop only) */}
        <div className="hidden md:flex w-full md:w-1/2 items-center justify-center bg-white relative overflow-hidden">
          <Image
            src="/assets/verify-otp.png"
            alt="Verify OTP Background"
            fill
            style={{ objectFit: "contain" }}
            priority
            className="relative z-10"
          />
        </div>

        {/* Mobile: Background image with low opacity */}
        <div className="absolute inset-0 md:hidden w-full h-full pointer-events-none z-0">
          <Image
            src="/assets/verify-otp.png"
            alt="Verify OTP Background"
            fill
            style={{ objectFit: "cover", opacity: 0.2 }}
            priority={false}
          />
        </div>

        <div className="w-full md:w-1/2 flex items-center justify-center px-4 md:px-8 py-12 md:py-0 md:bg-[var(--ch-offwhite)] relative z-20 md:z-auto min-h-screen md:min-h-auto">
          <div className="w-full max-w-md">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-[var(--ch-sage-dark)] mb-2">
                Invalid Request
              </h1>
              <p className="text-[var(--ch-text)]/60 mb-6">
                Email information is missing. Please register again.
              </p>
              <Button
                type="button"
                onClick={() => router.push("/register")}
                className="w-full bg-[var(--ch-sage-dark)] hover:bg-[var(--ch-sage-dark)]/90 text-white font-semibold py-2 rounded-lg transition"
              >
                Go to Register
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-white relative">
      {/* Left Section - Verify OTP Image (Desktop only) */}
      <div className="hidden md:flex w-full md:w-1/2 items-center justify-center bg-white relative overflow-hidden">
        <Image
          src="/assets/verify-otp.png"
          alt="Verify OTP Background"
          fill
          style={{ objectFit: "contain" }}
          priority
          className="relative z-10"
        />
      </div>

      {/* Mobile: Background image with low opacity */}
      <div className="absolute inset-0 md:hidden w-full h-full pointer-events-none z-0">
        <Image
          src="/assets/verify-otp.png"
          alt="Verify OTP Background"
          fill
          style={{ objectFit: "cover", opacity: 0.12 }}
          priority={false}
        />
      </div>

      <div className="w-full md:w-1/2 flex items-center justify-center px-4 md:px-8 py-12 md:py-0 md:bg-[var(--ch-offwhite)] relative z-20 md:z-auto min-h-screen md:min-h-auto">
        <div className="w-full max-w-md">
          <div>
            <div className="mb-8 text-center">
              <div className="flex justify-center mb-4"></div>
              <h2 className="text-3xl font-semibold text-[var(--ch-sage-dark)] mb-2">
                Verify Your Email
              </h2>
              <p className="text-[var(--ch-text)]/60">
                We&apos;ve sent an OTP to <br />
                <span className="font-semibold">{email}</span>
              </p>
            </div>

            <form onSubmit={handleVerifyOTP} className="space-y-6">
              <div>
                <p className="text-xs text-[var(--ch-text)]/60 mt-2 text-center">
                  Enter the 6-digit code from your email
                </p>
                <InputOTP
                  maxLength={6}
                  value={otp}
                  onChange={setOtp}
                  disabled={isLoading}
                  containerClassName="justify-center"
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                  </InputOTPGroup>
                  <InputOTPSeparator />
                  <InputOTPGroup>
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </div>

              <div className="text-center ">
                <p className="text-sm  text-[var(--ch-text)]">
                  OTP will expire in 60 seconds.
                </p>
              </div>

              <Button
                type="submit"
                disabled={isLoading || otp.length !== 6}
                className="w-full bg-[var(--ch-sage-dark)] hover:bg-[var(--ch-sage-dark)]/90 text-white font-semibold py-2 rounded-lg transition disabled:bg-[var(--ch-text)]/40 disabled:cursor-not-allowed"
              >
                {isLoading ? "Verifying..." : "Verify OTP"}
              </Button>
            </form>

            <div className="my-6 flex items-center">
              <div className="flex-1 border-t border-[var(--ch-taupe)]" />
              <span className="px-3 text-sm text-[var(--ch-text)]/50">OR</span>
              <div className="flex-1 border-t border-[var(--ch-taupe)]" />
            </div>

            <div className="text-center">
              <Button
                type="button"
                variant="link"
                onClick={handleResendOTP}
                disabled={isResending}
                className="text-[var(--ch-sage-dark)] font-semibold hover:underline disabled:text-[var(--ch-text)]/40 disabled:cursor-not-allowed p-0 h-auto min-h-0"
              >
                {isResending ? "Sending..." : "Resend OTP"}
              </Button>
            </div>

            <div className="pt-6 ">
              <p className="text-center text-[var(--ch-text)]/70">
                Already verified?{" "}
                <Button
                  type="button"
                  variant="link"
                  onClick={() => router.push("/login")}
                  className="font-semibold text-[var(--ch-sage-dark)] hover:underline p-0 h-auto min-h-0"
                >
                  Go to Login
                </Button>
              </p>
            </div>

            <p className="text-center text-xs text-[var(--ch-text)]/50 mt-6">
              By verifying your email, you agree to our{" "}
              <Link
                href="#"
                className="hover:underline text-[var(--ch-sage-dark)]"
              >
                Terms of Service
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
