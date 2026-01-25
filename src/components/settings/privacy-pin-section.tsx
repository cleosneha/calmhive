"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FaSpinner, FaEye, FaEyeSlash } from "react-icons/fa6";
import { TbLockPassword } from "react-icons/tb";
import {
  sendPrivacyPinOTP,
  verifyPrivacyPinOTP,
  setPrivacyPin,
} from "@/actions/settings/privacy-pin";
import { toast } from "sonner";

export function PrivacyPinSection() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState<
    "send-otp" | "enter-otp" | "set-pin"
  >("send-otp");
  const [otp, setOtp] = useState("");
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPin, setShowPin] = useState(false);
  const [showConfirmPin, setShowConfirmPin] = useState(false);

  const handleSendOTP = async () => {
    setIsLoading(true);
    try {
      const result = await sendPrivacyPinOTP();
      if (result.status === "success") {
        toast.success(result.message);
        setCurrentStep("enter-otp");
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error("Failed to send OTP");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp || otp.length !== 6) {
      toast.error("Please enter a valid 6-digit OTP");
      return;
    }

    setIsLoading(true);
    try {
      const result = await verifyPrivacyPinOTP(otp);
      if (result.status === "success") {
        toast.success(result.message);
        setCurrentStep("set-pin");
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error("Failed to verify OTP");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetPin = async () => {
    if (!pin || pin.length < 4 || pin.length > 6 || !/^\d+$/.test(pin)) {
      toast.error("PIN must be 4-6 digits");
      return;
    }

    if (pin !== confirmPin) {
      toast.error("PINs do not match");
      return;
    }

    setIsLoading(true);
    try {
      const result = await setPrivacyPin(pin);
      if (result.status === "success") {
        toast.success(result.message);
        setIsDialogOpen(false);
        resetForm();
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error("Failed to set PIN");
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setCurrentStep("send-otp");
    setOtp("");
    setPin("");
    setConfirmPin("");
  };

  const handleClose = () => {
    setIsDialogOpen(false);
    resetForm();
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-[var(--ch-slate-dark)]">
            Privacy PIN
          </h2>
          <p className="text-[var(--ch-slate)] mt-1">
            Set a PIN to protect your private journal entries and sensitive data
          </p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)} variant="outline">
          <TbLockPassword className="mr-2 h-4 w-4" />
          Update PIN
        </Button>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md max-h-[800px] overflow-y-auto top-1/2 -translate-y-1/2 bottom-auto">
          {/* Step indicators */}
          <div className="flex items-center justify-center gap-4 mb-4">
            {(["send-otp", "enter-otp", "set-pin"] as const).map(
              (step, idx) => {
                const isActive =
                  (step === "send-otp" && currentStep === "send-otp") ||
                  (step === "enter-otp" && currentStep === "enter-otp") ||
                  (step === "set-pin" && currentStep === "set-pin");

                return (
                  <div
                    key={step}
                    aria-current={isActive ? "step" : undefined}
                    className={`h-8 w-8 flex items-center justify-center rounded-full text-sm font-semibold transition-shadow ${
                      isActive
                        ? "bg-[var(--ch-sage-light)] text-black shadow-lg"
                        : "bg-[var(--ch-sage-light)]/10 text-black"
                    }`}
                  >
                    {idx + 1}
                  </div>
                );
              },
            )}
          </div>
          <DialogHeader className="items-center text-center">
            <DialogTitle className="mx-auto">
              {currentStep === "send-otp" && "Send Verification Code"}
              {currentStep === "enter-otp" && "Enter Verification Code"}
              {currentStep === "set-pin" && "Set New Privacy PIN"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {currentStep === "send-otp" && (
              <div className="text-center space-y-4">
                <p className="text-sm text-[var(--ch-slate)]">
                  We&apos;ll send a verification code to your email to confirm
                  this action.
                </p>
                <Button
                  onClick={handleSendOTP}
                  disabled={isLoading}
                  variant="outline"
                >
                  {isLoading ? (
                    <>
                      <FaSpinner className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    "Send Code"
                  )}
                </Button>
              </div>
            )}

            {currentStep === "enter-otp" && (
              <div className="space-y-4">
                <p className="text-sm text-[var(--ch-slate)] text-center">
                  Enter the 6-digit code sent to your email
                </p>
                <div>
                  <Label htmlFor="otp">Verification Code</Label>
                  <Input
                    id="otp"
                    type="text"
                    value={otp}
                    onChange={(e) =>
                      setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                    }
                    placeholder="000000"
                    maxLength={6}
                    className="text-center text-lg tracking-widest mt-4"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentStep("send-otp")}
                    className="flex-1"
                  >
                    Back
                  </Button>
                  <Button
                    onClick={handleVerifyOTP}
                    disabled={isLoading || otp.length !== 6}
                    variant="default"
                    className="flex-1 "
                  >
                    {isLoading ? (
                      <>
                        <FaSpinner className="mr-2 h-4 w-4 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      "Verify"
                    )}
                  </Button>
                </div>
              </div>
            )}

            {currentStep === "set-pin" && (
              <div className="space-y-4">
                <p className="text-sm text-[var(--ch-slate)] text-center">
                  Create a new 4-6 digit PIN for your privacy protection
                </p>
                <div className="mt-4">
                  <Label htmlFor="pin">New PIN</Label>
                  <div className="relative mt-2">
                    <Input
                      id="pin"
                      type={showPin ? "text" : "password"}
                      value={pin}
                      onChange={(e) =>
                        setPin(e.target.value.replace(/\D/g, "").slice(0, 6))
                      }
                      placeholder="Enter PIN"
                      maxLength={6}
                      className="pr-10 w-full"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowPin((s) => !s)}
                      aria-label={showPin ? "Hide PIN" : "Show PIN"}
                      className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0 text-[var(--ch-slate)]"
                    >
                      {showPin ? (
                        <FaEyeSlash className="h-4 w-4" />
                      ) : (
                        <FaEye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="mt-4">
                  <Label htmlFor="confirmPin">Confirm PIN</Label>
                  <div className="relative mt-2">
                    <Input
                      id="confirmPin"
                      type={showConfirmPin ? "text" : "password"}
                      value={confirmPin}
                      onChange={(e) =>
                        setConfirmPin(
                          e.target.value.replace(/\D/g, "").slice(0, 6),
                        )
                      }
                      placeholder="Confirm PIN"
                      maxLength={6}
                      className="pr-10 w-full"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowConfirmPin((s) => !s)}
                      aria-label={showConfirmPin ? "Hide PIN" : "Show PIN"}
                      className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0 text-[var(--ch-slate)]"
                    >
                      {showConfirmPin ? (
                        <FaEyeSlash className="h-4 w-4" />
                      ) : (
                        <FaEye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentStep("enter-otp")}
                    className="flex-1"
                  >
                    Back
                  </Button>
                  <Button
                    onClick={handleSetPin}
                    disabled={
                      isLoading || !pin || !confirmPin || pin !== confirmPin
                    }
                    variant="default"
                    className="flex-1 "
                  >
                    {isLoading ? (
                      <>
                        <FaSpinner className="mr-2 h-4 w-4 animate-spin" />
                        Setting...
                      </>
                    ) : (
                      "Set PIN"
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
