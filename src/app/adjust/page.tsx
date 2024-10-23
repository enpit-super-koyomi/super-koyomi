import { db } from '@/lib/prisma'
import SchedulePlanner from '@/app/adjust/client'

export default async function AdjustPage() {
  const users = await db.allUsers()
  return <SchedulePlanner users={users} />
}
