export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  color: string;
  description?: string;
}

export interface EditableCalendarEvent extends CalendarEvent {
  onEdit: (event: CalendarEvent) => void;
  onDelete: (id: string) => void;
}

