"use client";

import { useState } from "react";
import { toast } from "sonner";
import { HiOutlineEye, HiOutlineEyeOff } from "react-icons/hi";
import { FaGoogle } from "react-icons/fa";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { login } from "@/actions/auth/login";
import { authClient } from "@/lib/auth-client";
import { MdMail, MdLock } from "react-icons/md";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel, FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { InputGroup } from "@/components/ui/input-group";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const result = await login({ email, password });
    if ("error" in result) {
      toast.error(result.error || "Login failed. Please try again.");
    } else {
      toast.success("Login successful!");
      router.push("/user");
    }
    setIsLoading(false);
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      await authClient.signIn.social({
        provider: "google",
        callbackURL: "/user",
      });
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error("Google sign-in failed. Please try again.");
      }
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-white relative">
      {/* Left Section - Login Image */}
      {/* Desktop: Visible on left side */}
      <div className="hidden md:flex w-full md:w-1/2 items-center justify-center bg-white relative overflow-hidden">
        <Image
          src="/assets/login.png"
          alt="Login Background"
          fill
          style={{ objectFit: "contain" }}
          priority
          className="relative z-10"
        />
      </div>

      {/* Mobile: Background image with low opacity */}
      <div className="absolute inset-0 md:hidden w-full h-full pointer-events-none z-0">
        <Image
          src="/assets/login.png"
          alt="Login Background"
          fill
          style={{ objectFit: "cover", opacity: 0.2 }}
          priority={false}
        />
      </div>

      {/* Right Section - Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center px-6 md:px-12 py-8 md:py-0 md:bg-[var(--ch-offwhite)] relative z-20 md:z-auto min-h-screen md:min-h-auto">
        <div className="w-full max-w-sm">
          <div>
            {/* Header */}
            <div className="mb-6 text-center">
              <h2 className="text-2xl font-bold text-[var(--ch-sage-dark)] mb-1">
                Sign In
              </h2>
            </div>

            {/* Form */}
            <form onSubmit={handleLogin} className="space-y-4">
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="email">Email Address</FieldLabel>
                  <InputGroup>
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                      <MdMail className="text-[var(--ch-text)]/40 text-lg" />
                    </span>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      required
                      disabled={isLoading}
                      className="pl-10 pr-3"
                    />
                  </InputGroup>
                </Field>
                <Field>
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                  <InputGroup>
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                      <MdLock className="text-[var(--ch-text)]/40 text-lg" />
                    </span>
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      disabled={isLoading}
                      className="pl-10 pr-10"
                    />
                    <Button
                      type="button"
                      tabIndex={-1}
                      variant="ghost"
                      size="icon"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[var(--ch-text)]/40 text-lg focus:outline-none cursor-pointer p-0 h-6 w-6"
                      onClick={() => setShowPassword((v) => !v)}
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                    >
                      {showPassword ? <HiOutlineEyeOff /> : <HiOutlineEye />}
                    </Button>
                  </InputGroup>
                </Field>
              </FieldGroup>

              {/* Error Message removed, now using toast */}

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[var(--ch-sage-dark)] hover:bg-[var(--ch-sage-dark)]/90 text-white font-semibold py-2 rounded-lg text-sm transition disabled:bg-[var(--ch-text)]/40 disabled:cursor-not-allowed"
              >
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
            </form>

            {/* Divider */}
            <div className="my-4 flex items-center">
              <div className="flex-1 border-t border-[var(--ch-taupe)]" />
              <span className="px-2 text-xs text-[var(--ch-text)]/50">OR</span>
              <div className="flex-1 border-t border-[var(--ch-taupe)]" />
            </div>

            {/* Google Sign In Button */}
            <Button
              type="button"
              variant="outline"
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 bg-white border border-[var(--ch-taupe)] hover:bg-[var(--ch-taupe)]/30 text-[var(--ch-text)] font-semibold py-2 rounded-lg text-sm shadow-sm transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FaGoogle className="text-lg" />
              Continue with Google
            </Button>

            {/* Sign Up Link */}
            <div className="text-center mt-2">
              <p className="text-xs text-[var(--ch-text)]/70">
                Don&apos;t have an account?{" "}
                <Link
                  href="/register"
                  className="font-semibold text-[var(--ch-sage-dark)] hover:underline"
                >
                  Create one
                </Link>
              </p>
            </div>

            {/* Footer */}
            <p className="text-center text-xs text-[var(--ch-text)]/50 mt-4">
              By logging in, you agree to our{" "}
              <Link
                href="#"
                className="hover:underline text-[var(--ch-sage-dark)]"
              >
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link
                href="#"
                className="hover:underline text-[var(--ch-sage-dark)]"
              >
                Privacy Policy
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
