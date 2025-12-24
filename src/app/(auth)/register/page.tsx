"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { registerUser } from "@/actions/auth/register";
import { authClient } from "@/lib/auth-client";
import { MdMail, MdLock, MdPerson } from "react-icons/md";
import { HiOutlineEye, HiOutlineEyeOff } from "react-icons/hi";
import AuthLeftSection from "@/components/auth/AuthLeftSection";
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
      console.log("Register result:", result);
      if (result.status === "success") {
        toast.success("Account created! Please verify your email.");
        router.push(`/verify-email?email=${encodeURIComponent(email)}`);
      } else {
        toast.error(result.error || "Registration failed. Please try again.");
      }
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : "Registration failed. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    try {
      await authClient.signIn.social({
        provider: "google",
        callbackURL: "/user",
      });
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Google sign-up failed."
      );
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-white">
      <AuthLeftSection type="register" />

      <div className="w-full md:w-1/2 flex items-center justify-center px-6 md:px-12 py-8 md:py-0 bg-[var(--ch-offwhite)]">
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
                    <button
                      type="button"
                      tabIndex={-1}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[var(--ch-text)]/40 text-lg focus:outline-none cursor-pointer"
                      onClick={() => setShowPassword((v) => !v)}
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                    >
                      {showPassword ? <HiOutlineEyeOff /> : <HiOutlineEye />}
                    </button>
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
                    <button
                      type="button"
                      tabIndex={-1}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-[var(--ch-text)]/40 text-lg focus:outline-none"
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
                    </button>
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
              className="w-full flex items-center justify-center gap-2 mt-4 bg-white border border-[var(--ch-taupe)] hover:bg-[var(--ch-taupe)]/30 text-[var(--ch-text)] font-semibold py-2 rounded-lg text-sm shadow-sm transition"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 48 48"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <g clipPath="url(#clip0_17_40)">
                  <path
                    d="M47.5 24.5C47.5 22.6 47.3 20.8 47 19H24V29.1H37.4C36.7 32.2 34.7 34.7 31.8 36.4V42.1H39.3C44 38 47.5 31.9 47.5 24.5Z"
                    fill="#4285F4"
                  />
                  <path
                    d="M24 48C30.6 48 36.1 45.9 39.3 42.1L31.8 36.4C30 37.6 27.7 38.4 24 38.4C17.7 38.4 12.2 34.3 10.4 28.7H2.6V34.6C5.8 41.1 14.1 48 24 48Z"
                    fill="#34A853"
                  />
                  <path
                    d="M10.4 28.7C9.9 27.5 9.6 26.2 9.6 24.8C9.6 23.4 9.9 22.1 10.4 20.9V15H2.6C1 18.1 0 21.4 0 24.8C0 28.2 1 31.5 2.6 34.6L10.4 28.7Z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M24 9.6C27.7 9.6 30.6 10.9 32.6 12.7L39.5 6.1C36.1 2.9 30.6 0 24 0C14.1 0 5.8 6.9 2.6 15L10.4 20.9C12.2 15.3 17.7 9.6 24 9.6Z"
                    fill="#EA4335"
                  />
                </g>
                <defs>
                  <clipPath id="clip0_17_40">
                    <rect width="48" height="48" fill="white" />
                  </clipPath>
                </defs>
              </svg>
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
