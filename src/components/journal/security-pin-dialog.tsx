"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FaSpinner, FaEye, FaEyeSlash } from "react-icons/fa6";
import { FiLock } from "react-icons/fi";
import { verifySecurityPin } from "@/actions/journal/secure-entry";
import { toast } from "sonner";

interface SecurityPinDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  title?: string;
  description?: string;
}

export function SecurityPinDialog({
  isOpen,
  onClose,
  onSuccess,
  title = "Enter Security PIN",
  description = "Please enter your security PIN to access this content.",
}: SecurityPinDialogProps) {
  const [pin, setPin] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPin, setShowPin] = useState(false);
  const [error, setError] = useState("");
  const [needsPinSetup, setNeedsPinSetup] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!pin.trim()) {
      setError("Please enter your PIN");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const result = await verifySecurityPin(pin.trim());

      if (result.success) {
        toast.success("PIN verified successfully");
        setPin("");
        setError("");
        setNeedsPinSetup(false);
        onSuccess();
        onClose();
      } else {
        if (result.message === "No security PIN set") {
          setNeedsPinSetup(true);
          setError("");
        } else {
          setError(result.message || "Invalid PIN");
          toast.error(result.message || "Invalid PIN");
        }
      }
    } catch {
      setError("Failed to verify PIN");
      toast.error("Failed to verify PIN");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setPin("");
    setError("");
    setShowPin(false);
    setNeedsPinSetup(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md h-[300px] overflow-y-auto top-1/2 -translate-y-1/2 bottom-auto">
        {!needsPinSetup && (
          <DialogHeader className="pb-2">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-[var(--ch-sage-dark)] flex items-center justify-center mt-1">
                <FiLock className="text-white text-sm" />
              </div>
              <div className="flex-1">
                <DialogTitle className="text-left text-lg mb-1">
                  {title}
                </DialogTitle>
                <DialogDescription className="text-left text-sm">
                  {description}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          {needsPinSetup ? (
            <div className="space-y-4 text-center">
              <div className="w-12 h-12 rounded-full bg-[var(--ch-sage-light)] flex items-center justify-center mx-auto">
                <FiLock className="text-[var(--ch-sage-dark)] text-xl" />
              </div>
              <div>
                <h3 className="font-semibold text-[var(--ch-slate-dark)] mb-2">
                  Security PIN Required
                </h3>
                <p className="text-sm text-[var(--ch-slate)] mb-4">
                  You need to set up a security PIN to access private journal
                  entries. This helps protect your sensitive information.
                </p>
              </div>
              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={() => (window.location.href = "/user/settings")}
                  className="flex-1 bg-[var(--ch-sage-dark)] hover:bg-[var(--ch-sage)]"
                >
                  Go to Settings
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                <Label htmlFor="pin">Security PIN</Label>
                <div className="relative">
                  <Input
                    id="pin"
                    type={showPin ? "text" : "password"}
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    placeholder="Enter your PIN"
                    className={`pr-10 ${error ? "border-red-500" : ""}`}
                    maxLength={6}
                    autoComplete="off"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPin(!showPin)}
                  >
                    {showPin ? (
                      <FaEyeSlash className="h-4 w-4 text-[var(--ch-slate)]" />
                    ) : (
                      <FaEye className="h-4 w-4 text-[var(--ch-slate)]" />
                    )}
                  </Button>
                </div>
                {error && <p className="text-sm text-red-600">{error}</p>}
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  className="flex-1"
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="default"
                  className="flex-1"
                  disabled={isLoading || !pin.trim()}
                >
                  {isLoading ? (
                    <>
                      <FaSpinner className="mr-2 h-4 w-4 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    "Verify PIN"
                  )}
                </Button>
              </div>
            </>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
}
