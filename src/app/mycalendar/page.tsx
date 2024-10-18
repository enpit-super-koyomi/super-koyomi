import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { db } from "@/lib/prisma";
import { GoogleCalendar } from "@/lib/googleCalendar";

export default async function Page() {
  const session = await getServerSession(authOptions);

  if (!session) return <h1>Not signed in</h1>;

  const account = await db.findAccount(session.user.id);
  if (!account) return <h1>Account not found</h1>;
  if (!account.access_token) return <h1>Access token not found</h1>;
  
  const calender = new GoogleCalendar(account.access_token);
  const event = await calender.getEvents();

  return (
    <div>
      <h1>My Calendar</h1>
      {event.map((e) => (
        <div key={e.id} className="border p-2 flex gap-1">
          <p>{e.summary}</p>
          <p>{e.start.toLocaleDateString()}</p>
          <p>{e.end.toLocaleTimeString()}</p>
        </div>
      ))}
    </div>
  );
}
