import {
  Calendar,
  CalEvent,
  DEFAULT_EVENT,
  EventStatus,
} from "@/logic/calendar";
import { google, calendar_v3 } from "googleapis";

const FETCH_EVENTS_DURATION = 7 * 24 * 60 * 60 * 1000;

export class GoogleCalendar implements Calendar {
  private client: calendar_v3.Calendar;

  constructor(accessToken: string) {
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: accessToken });
    this.client = google.calendar({ version: "v3", auth: oauth2Client });
  }

  async getEvents(): Promise<CalEvent[]> {
    const { data: calendars } = await this.client.calendarList.list();
    const primaryCalendarId = calendars.items?.find(
      (calendar) => calendar.primary
    )?.id;
    if (!primaryCalendarId) {
      throw new Error("Primary calendar not found");
    }

    const { data: events } = await this.client.events.list({
      calendarId: primaryCalendarId!,
      timeMin: new Date().toISOString(),
      timeMax: new Date(Date.now() + FETCH_EVENTS_DURATION).toISOString(),
    });

    return (
      events.items?.map((event) => ({
        id: event.id ?? null,
        summary: event.summary ?? DEFAULT_EVENT.summary,
        description: event.description ?? null,
        location: event.location ?? null,
        start: event.start
          ? new Date(event.start.dateTime!)
          : DEFAULT_EVENT.start,
        end: event.end ? new Date(event.end.dateTime!) : DEFAULT_EVENT.end,
        status: event.status
          ? this.validateEventStatus(event.status)
            ? event.status
            : null
          : null,
      })) ?? []
    );
  }

  private validateEventStatus(status: string): status is EventStatus {
    return ["CONFIRMED", "TENTATIVE", "CANCELLED"].includes(status);
  }
}
