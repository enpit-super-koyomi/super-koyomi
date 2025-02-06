"use client"
import { forwardRef } from "react"
import { Button } from "@/components/ui/button"

interface YesNoDialogOptions {
  message: string
  yesButton: string
  noButton: string
  onYes?: () => void
  onNo?: () => void
}

export const YesNoDialog = forwardRef<HTMLDialogElement, YesNoDialogOptions>(
  ({ message, yesButton, noButton, onYes, onNo }, ref) => {
    return (
      <dialog ref={ref} className="p-4 rounded-lg shadow-lg">
        <div className="mb-4">{message}</div>
        <form method="dialog">
          <Button onClick={onNo} variant="outline">
            {noButton}
          </Button>
          <Button onClick={onYes}>{yesButton}</Button>
        </form>
      </dialog>
    )
  },
)
YesNoDialog.displayName = "YesNoDialog"
