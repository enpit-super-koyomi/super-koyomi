import { db } from '@/lib/prisma'
import SchedulePlanner from '@/app/adjust/client'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export default async function AdjustPage() {
  const session = await getServerSession(authOptions)
  const users = (await db.allUsers())
    .filter(user => user.email !== session?.user.email);

  return <SchedulePlanner users={users} session={session ?? undefined} />
}
