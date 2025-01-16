"use client"

import { generateFriendToken } from "@/lib/generateFriendToken"
import { useState } from "react"
import { toast } from "react-toastify"

/**
 * Generates friend invitation URL and displays it.
 */
export default function InvitationUrlGenerator(props: { tokenOwner: string }) {
  const [tokenUrl, setTokenUrl] = useState("")

  async function handleGenerateToken() {
    const token = await generateFriendToken(props.tokenOwner)
    const url = `${window.location.origin}/be_friends/${token}`
    setTokenUrl(url)
  }

  function handleCopyUrl() {
    navigator.clipboard.writeText(tokenUrl)
    toast("URL copied!")
  }

  return (
    <div>
      <button
        onClick={handleGenerateToken}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >
        Generate invitation URL
      </button>
      {tokenUrl && (
        <div className="mt-4">
          <div className="flex">
            <input type="text" value={tokenUrl} readOnly className="border p-2 flex-grow" />
            <button
              onClick={handleCopyUrl}
              className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 ml-2"
            >
              Copy
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
