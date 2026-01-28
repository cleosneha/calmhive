"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { registerUser } from "@/actions/auth/register";
import { authClient } from "@/lib/auth-client";
import { MdMail, MdLock, MdPerson } from "react-icons/md";
import { HiOutlineEye, HiOutlineEyeOff } from "react-icons/hi";
import { FaGoogle } from "react-icons/fa";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel, FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { InputGroup } from "@/components/ui/input-group";
import { toast } from "sonner";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsLoading(true);
    try {
      const result = await registerUser({
        name,
        email,
        password,
        confirmPassword,
      });
      if ("error" in result) {
        toast.error(result.error || "Registration failed. Please try again.");
      } else {
        toast.success("Account created! Please verify your email.");
        router.push(`/verify-email?email=${encodeURIComponent(email)}`);
      }
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : "Registration failed. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setIsLoading(true);
    try {
      await authClient.signIn.social({
        provider: "google",
        callbackURL: "/user",
      });
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Google sign-up failed.",
      );
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-white relative">
      {/* Left Section - Register Image (Desktop only) */}
      <div className="hidden md:flex w-full md:w-1/2 items-center justify-center bg-white relative overflow-hidden">
        <Image
          src="/assets/register.png"
          alt="Register Background"
          fill
          style={{ objectFit: "contain" }}
          priority
          className="relative z-10"
        />
      </div>

      {/* Mobile: Background image with low opacity */}
      <div className="absolute inset-0 md:hidden w-full h-full pointer-events-none z-0">
        <Image
          src="/assets/register.png"
          alt="Register Background"
          fill
          style={{ objectFit: "cover", opacity: 0.2 }}
          priority={false}
        />
      </div>

      {/* Right Section - Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center px-6 md:px-12 py-8 md:py-0 md:bg-[var(--ch-offwhite)] relative z-20 md:z-auto min-h-screen md:min-h-auto">
        <div className="w-full max-w-sm">
          <div>
            <div className="mb-6 text-center">
              <h2 className="text-2xl font-bold text-[var(--ch-sage-dark)] mb-1">
                Create Account
              </h2>
              <p className="text-xs text-[var(--ch-text)]/60">
                Join us on your mindfulness journey
              </p>
            </div>

            <form onSubmit={handleRegister} className="space-y-4">
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="name">Full Name</FieldLabel>
                  <InputGroup>
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                      <MdPerson className="text-[var(--ch-text)]/40 text-lg" />
                    </span>
                    <Input
                      id="name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="John Doe"
                      required
                      disabled={isLoading}
                      className="pl-10 pr-3"
                    />
                  </InputGroup>
                </Field>
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
                <Field>
                  <FieldLabel htmlFor="confirmPassword">
                    Confirm Password
                  </FieldLabel>
                  <InputGroup>
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                      <MdLock className="text-[var(--ch-text)]/40 text-lg" />
                    </span>
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
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
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-[var(--ch-text)]/40 text-lg focus:outline-none p-0 h-6 w-6"
                      onClick={() => setShowConfirmPassword((v) => !v)}
                      aria-label={
                        showConfirmPassword ? "Hide password" : "Show password"
                      }
                    >
                      {showConfirmPassword ? (
                        <HiOutlineEyeOff />
                      ) : (
                        <HiOutlineEye />
                      )}
                    </Button>
                  </InputGroup>
                </Field>
              </FieldGroup>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[var(--ch-sage-dark)] hover:bg-[var(--ch-sage-dark)]/90 text-white font-semibold py-2 rounded-lg text-sm transition disabled:bg-[var(--ch-text)]/40 disabled:cursor-not-allowed"
              >
                {isLoading ? "Creating Account..." : "Create Account"}
              </Button>
            </form>

            {/* Google Auth Button */}
            <Button
              type="button"
              variant="outline"
              onClick={handleGoogleSignup}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 mt-4 bg-white border border-[var(--ch-taupe)] hover:bg-[var(--ch-taupe)]/30 text-[var(--ch-text)] font-semibold py-2 rounded-lg text-sm shadow-sm transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FaGoogle className="text-lg" />
              Continue with Google
            </Button>

            <div className="text-center mt-4">
              <p className="text-xs text-[var(--ch-text)]/70">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="font-semibold text-[var(--ch-sage-dark)] hover:underline"
                >
                  Sign in
                </Link>
              </p>
            </div>

            <p className="text-center text-xs text-[var(--ch-text)]/50 mt-4">
              By creating an account, you agree to our{" "}
              <Link
                href="/terms-of-service"
                className="hover:underline text-[var(--ch-sage-dark)]"
              >
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link
                href="/privacy-policy"
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
