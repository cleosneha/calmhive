"use client";

import { useState, useEffect } from "react";
import LockedChats from "./client";
import { SecurityPinDialog } from "@/components/journal/security-pin-dialog";
import { getLockedEntries } from "@/actions/journal/get-locked-entries";

type Entry = {
  id: number;
  title: string;
  date: Date;
  excerpt?: string;
  mood?: string;
  pinned?: boolean;
};

export default function LockedChatsPage() {
  const [isVerified, setIsVerified] = useState(false);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [userImage, setUserImage] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState(false);

  // Check if user is already verified
  useEffect(() => {
    const verificationData = localStorage.getItem("lockedEntriesVerified");
    if (verificationData) {
      try {
        const parsed = JSON.parse(verificationData);
        if (parsed.verified && parsed.expiresAt > Date.now()) {
          // Still valid, auto-verify
          setIsVerified(true);
          handlePinVerification();
        } else {
          // Expired, remove from storage
          localStorage.removeItem("lockedEntriesVerified");
        }
      } catch {
        // Invalid data, remove it
        localStorage.removeItem("lockedEntriesVerified");
      }
    }
  }, []);

  const handlePinVerification = async () => {
    setIsLoading(true);
    try {
      const result = await getLockedEntries();

      if (result.success && result.data) {
        setEntries(result.data.entries);
        setUserImage(result.data.userImage);
        setIsVerified(true);

        // Store verification in localStorage
        const verificationData = {
          verified: true,
          timestamp: Date.now(),
          expiresAt: Date.now() + 30 * 60 * 1000, // 30 minutes
        };
        localStorage.setItem(
          "lockedEntriesVerified",
          JSON.stringify(verificationData),
        );
      } else {
        console.error("Failed to fetch locked entries:", result.message);
      }
    } catch (error) {
      console.error("Error fetching locked entries:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--ch-sage-dark)] mx-auto mb-4"></div>
          <p className="text-[var(--ch-slate)]">Loading locked entries...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <SecurityPinDialog
        isOpen={!isVerified}
        onClose={() => {
          // Redirect back to journal if user cancels
          window.history.back();
        }}
        onSuccess={handlePinVerification}
        title="Access Locked Entries"
        description="Enter your security PIN to view your private journal entries."
      />

      {isVerified && <LockedChats entries={entries} userImage={userImage} />}
    </>
  );
}
