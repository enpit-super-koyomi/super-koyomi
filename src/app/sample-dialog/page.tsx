"use client";

import { useRef } from "react";
import { YesNoDialog } from "@/components/ui/dialog";

export default function Candidate() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const dialog = <YesNoDialog dialogText="This is a dialog" ref={dialogRef} />;

  function showDialog() {
    if (!dialogRef.current) throw new Error("Internal error");
    dialogRef.current.showModal();
    console.log("HELLO");
  }

  return (
    <div
      className="py-4"
      style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
      }}
    >
      {dialog}
      <button onClick={showDialog}>Show dialog</button>
    </div>
  );
}
