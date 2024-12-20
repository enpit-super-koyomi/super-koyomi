"use client";
import { forwardRef } from "react";
import { Button } from "@/components/ui/button";

interface YesNoDialogOptions {
  message: string;
  onYes?: () => void;
  onNo?: () => void;
}

export const YesNoDialog = forwardRef<HTMLDialogElement, YesNoDialogOptions>(
  ({ message, onYes, onNo }, ref) => {
    return (
      <dialog ref={ref} className="p-4 rounded-lg shadow-lg">
        <div className="mb-4">{message}</div>
        <form method="dialog">
          <Button onClick={onNo} variant="outline">
            No
          </Button>
          <Button onClick={onYes}>Yes</Button>
        </form>
      </dialog>
    );
  }
);
YesNoDialog.displayName = "YesNoDialog";
