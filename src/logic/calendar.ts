export interface Calendar {
  getEvents(): Promise<CalEvent[]>;
  addEvent(event: CalEvent): Promise<CalEvent>;
}

export type CalEvent = {
  id: string | null;
  summary: string;
  description: string | null;
  location: string | null;
  start: Date;
  end: Date;
  status: EventStatus | null;
  attendees: Attendee[];
};

export type SlimedCalEvent = {
  id?: string | null;
  summary?: string;
  description?: string | null;
  location?: string | null;
  start: Date;
  end: Date;
  status?: EventStatus | null;
  attendees?: Attendee[];
};

export type Attendee = {
  email: string | null;
};

export type EventStatus = "CONFIRMED" | "TENTATIVE" | "CANCELLED";

export const DEFAULT_EVENT = {
  summary: "タイトルなし",
  start: new Date(),
  end: new Date(),
};
