"use server"
import { db } from "@/lib/prisma"
import { GoogleCalendar } from "./googleCalendar"
import { getServerSession } from "next-auth"
import { authOptions } from "./auth"

export async function getHostEvents() {
  // const start =

  const session = await getServerSession(authOptions)
  if (!session?.user.id) return
  const account = await db.findAccount(session.user.id)
  if (!account?.access_token) return
  const calendar = new GoogleCalendar(account.access_token)
  const events = await calendar.getEvents()

  // const end = window.performance.now()
  // console.log(`getHostEvents took ${end - start}ms`)

  return events
}