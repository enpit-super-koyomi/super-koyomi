"use client";
import * as React from "react";

interface YesNoDialogOptions {
  dialogText: string;
}

const YesNoDialog = React.forwardRef<HTMLDialogElement, YesNoDialogOptions>(
  ({ dialogText }, ref) => {
    return (
      <dialog ref={ref}>
        <div>{dialogText}</div>
        <form method="dialog">
          <button name="yes">YES</button>
          <button name="no">NO</button>
        </form>
      </dialog>
    );
  }
);
YesNoDialog.displayName = "Dialog";

export { YesNoDialog };
