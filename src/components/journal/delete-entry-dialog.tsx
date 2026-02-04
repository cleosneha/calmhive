"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FiAlertTriangle } from "react-icons/fi";

interface DeleteEntryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  entryTitle?: string;
}

export function DeleteEntryDialog({
  isOpen,
  onClose,
  onConfirm,
  entryTitle = "this entry",
}: DeleteEntryDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <FiAlertTriangle className="text-red-600 text-xl flex-shrink-0" />
            <DialogTitle>Delete Entry</DialogTitle>
          </div>
          <DialogDescription className="mt-2">
            Are you sure you want to delete &apos;{entryTitle}&apos;? This
            action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex gap-3 justify-end">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
