import {
  Calendar,
  CalEvent,
  DEFAULT_EVENT,
  EventStatus,
} from "@/logic/calendar";
import { google, calendar_v3 } from "googleapis";

const FETCH_EVENTS_DURATION = 7 * 24 * 60 * 60 * 1000;

const SUPER_KOYOMI_CALENDAR_NAME = "スーパーこよみで追加された予定";

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
      singleEvents: true,
      orderBy: "startTime",
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
        attendees:
          event.attendees?.map((it) => ({ email: it.email ?? null })) ?? [],
      })) ?? []
    );
  }

  async addEvent(event: CalEvent): Promise<CalEvent> {
    const { data: calendars } = await this.client.calendarList.list();
    let superKoyomiCalendarId = calendars.items?.find(
      (calendar) => calendar.summary === SUPER_KOYOMI_CALENDAR_NAME
    )?.id;

    if (!superKoyomiCalendarId) {
      const result = await this.client.calendars.insert({
        requestBody: { summary: SUPER_KOYOMI_CALENDAR_NAME },
      });
      superKoyomiCalendarId = result.data.id;
    }

    if (!superKoyomiCalendarId) {
      throw new Error("Super Koyomi calendar not found");
    }

    console.log(event.start.toISOString());

    const { data: insertedEvent } = await this.client.events.insert({
      calendarId: superKoyomiCalendarId,
      requestBody: {
        summary: event.summary,
        start: { dateTime: event.start.toISOString() },
        end: { dateTime: event.end.toISOString() },
        attendees: event.attendees,
      },
    });

    return {
      id: insertedEvent.id ?? null,
      summary: insertedEvent.summary ?? DEFAULT_EVENT.summary,
      description: insertedEvent.description ?? null,
      location: insertedEvent.location ?? null,
      start: insertedEvent.start
        ? new Date(insertedEvent.start.dateTime!)
        : DEFAULT_EVENT.start,
      end: insertedEvent.end
        ? new Date(insertedEvent.end.dateTime!)
        : DEFAULT_EVENT.end,
      status: insertedEvent.status
        ? this.validateEventStatus(insertedEvent.status)
          ? insertedEvent.status
          : null
        : null,
      attendees:
        insertedEvent.attendees?.map((it) => ({ email: it.email ?? null })) ??
        [],
    };
  }

  private validateEventStatus(status: string): status is EventStatus {
    return ["CONFIRMED", "TENTATIVE", "CANCELLED"].includes(status);
  }
}
