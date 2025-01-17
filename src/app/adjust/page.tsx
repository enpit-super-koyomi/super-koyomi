import { db } from "@/lib/prisma"
import SchedulePlanner from "@/app/adjust/client"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export default async function AdjustPage() {
  const session = await getServerSession(authOptions)
  const friends = session?.user.id == undefined ? [] : await db.friendsOf(session.user.id)

  return <SchedulePlanner users={friends} isSignedIn={!!session} myId={session?.user.id} />
}
