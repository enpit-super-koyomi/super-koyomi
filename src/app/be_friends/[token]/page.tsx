import { authOptions } from "@/lib/auth"
import { db } from "@/lib/prisma"
import { getServerSession } from "next-auth"

/**
 * Friend registration page
 */
export default async function RedeemPage({ params }: { params: { token: string } }) {
  const tokenOwner = await db.redeemFriendToken(params.token)
  const session = await getServerSession(authOptions)
  const signedIn = !!session
  let registered = false

  if (signedIn && tokenOwner != null) {
    registered = await db.beFriends(session.user.id, tokenOwner)
  }

  return (
    <div
      className="container mx-auto text-center"
      style={{
        width: "100%",
        height: "95dvh",
        display: "grid",
        placeItems: "center",
      }}
    >
      {signedIn ? (
        registered ? (
          <p className="text-green-600">Registration completed.</p>
        ) : (
          <p className="text-red-600">Invalid or expired token.</p>
        )
      ) : (
        <p className="text-red-600">You must sign in at first.</p>
      )}
    </div>
  )
}
