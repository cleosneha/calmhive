"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { MdDeleteForever } from "react-icons/md";
import { deleteUserAccount } from "@/actions/auth";
import { toast } from "sonner";

export function DeleteAccount() {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Handles account deletion confirmation
  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    setShowDeleteDialog(false);

    try {
      const result = await deleteUserAccount();
      if ("success" in result && result.success) {
        // Server action already signs out the user
        // Show success message and redirect
        toast.success("Account deleted successfully");
        // Use href for hard navigation to clear all client state
        window.location.href = "/";
      } else {
        toast.error(
          "message" in result
            ? result.message
            : "Failed to delete account. Please try again.",
        );
        setIsDeleting(false);
      }
    } catch (error) {
      console.error("Error deleting account:", error);
      toast.error("Failed to delete account. Please try again.");
      setIsDeleting(false);
    }
  };

  // Show delete confirmation dialog
  const handleDeleteAccount = () => {
    setShowDeleteDialog(true);
  };

  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-6 mt-8">
      <h3 className="text-lg font-semibold text-red-800 mb-4">Danger Zone</h3>
      <p className="text-red-700 mb-4">
        Once you delete your account, there is no going back. Please be certain.
      </p>
      <Button
        onClick={handleDeleteAccount}
        disabled={isDeleting}
        variant="destructive"
        className="bg-red-600 hover:bg-red-700 text-white"
      >
        <MdDeleteForever className="mr-2 h-4 w-4" />
        {isDeleting ? "Deleting..." : "Delete Account"}
      </Button>

      {/* Delete Account Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="bg-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-600">
              Delete Account
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete your account? This action cannot
              be undone and will permanently delete all your data including
              journal entries, plans, insights, and vector embeddings.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="cursor-pointer">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 text-white cursor-pointer"
            >
              {isDeleting ? "Deleting..." : "Delete Account"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
