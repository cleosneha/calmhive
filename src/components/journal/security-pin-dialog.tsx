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
        onSuccess();
        onClose();
      } else {
        setError(result.message || "Invalid PIN");
        toast.error(result.message || "Invalid PIN");
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
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md h-[300px] overflow-y-auto top-1/2 -translate-y-1/2 bottom-auto">
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

        <form onSubmit={handleSubmit} className="space-y-3">
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
        </form>
      </DialogContent>
    </Dialog>
  );
}
