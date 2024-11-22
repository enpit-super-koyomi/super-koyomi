import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { EditableCalendarEvent } from './types';
import { formatTime } from './utils';

interface EventModalProps {
  event: EditableCalendarEvent | null;
  isOpen: boolean;
  onClose: () => void;
}

export function EventModal({ event, isOpen, onClose }: EventModalProps) {
  const [editedEvent, setEditedEvent] = useState<EditableCalendarEvent | null>(event);

  if (!event) return null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (editedEvent) {
      setEditedEvent({ ...editedEvent, [e.target.name]: e.target.value });
    }
  };

  const handleSave = () => {
    if (editedEvent) {
      event.onEdit(editedEvent);
    }
    onClose();
  };

  const handleDelete = () => {
    event.onDelete(event.id);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>予定の詳細</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="title" className="text-right">
              タイトル
            </label>
            <Input
              id="title"
              name="title"
              value={editedEvent?.title}
              onChange={handleInputChange}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="description" className="text-right">
              説明
            </label>
            <Textarea
              id="description"
              name="description"
              value={editedEvent?.description || ''}
              onChange={handleInputChange}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <label className="text-right">時間</label>
            <div className="col-span-3">
              {formatTime(event.start)} - {formatTime(event.end)}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleDelete}>
            削除
          </Button>
          <Button onClick={handleSave}>保存</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

