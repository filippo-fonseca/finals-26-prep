"use client";

import { useState, useEffect } from "react";
import { Course, courseInfo, Task } from "@/data/schedule";
import { cn, formatDateShort } from "@/lib/utils";
import { CourseIcon } from "./Icons";

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: Omit<Task, "id" | "createdAt">, date: string) => void;
  onDelete?: () => void;
  onReschedule?: (newDate: string) => void;
  initialTask?: Task;
  initialDate: string;
  mode: "create" | "edit";
}

const courses: Course[] = ["CPSC 4520", "ECE 3101", "MENG 3323"];

export function TaskModal({
  isOpen,
  onClose,
  onSave,
  onDelete,
  onReschedule,
  initialTask,
  initialDate,
  mode,
}: TaskModalProps) {
  const [course, setCourse] = useState<Course>(initialTask?.course || "CPSC 4520");
  const [description, setDescription] = useState(initialTask?.description || "");
  const [date, setDate] = useState(initialDate);

  useEffect(() => {
    if (isOpen) {
      setCourse(initialTask?.course || "CPSC 4520");
      setDescription(initialTask?.description || "");
      setDate(initialTask?.date || initialDate);
    }
  }, [isOpen, initialTask, initialDate]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (!description.trim()) return;
    onSave({ course, description: description.trim(), date }, date);
    onClose();
  };

  const handleRescheduleToTomorrow = () => {
    const currentDate = initialTask?.date || date;
    const tomorrow = new Date(currentDate + "T12:00:00");
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split("T")[0];
    onReschedule?.(tomorrowStr);
    onClose();
  };

  const handleRescheduleToDate = () => {
    const originalDate = initialTask?.date || initialDate;
    if (date !== originalDate) {
      onReschedule?.(date);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-background border border-border rounded-2xl shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-medium text-foreground">
            {mode === "create" ? "Add Task" : "Edit Task"}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-background-secondary text-foreground-muted hover:text-foreground transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Course Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground-muted">Course</label>
            <div className="flex gap-2">
              {courses.map((c) => {
                const info = courseInfo[c];
                const isSelected = course === c;
                return (
                  <button
                    key={c}
                    onClick={() => setCourse(c)}
                    className={cn(
                      "flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border transition-all",
                      isSelected
                        ? `bg-${info.color}-bg border-${info.color}-border text-${info.color}`
                        : "bg-background-secondary border-border text-foreground-secondary hover:border-foreground-muted"
                    )}
                  >
                    <CourseIcon course={c} className="w-4 h-4" />
                    <span className="text-sm font-medium">{info.shortName}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground-muted">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What do you need to study?"
              className="w-full px-4 py-3 bg-background-secondary border border-border rounded-xl text-foreground placeholder:text-foreground-muted/60 resize-none focus:border-cpsc/50"
              rows={3}
              autoFocus
            />
          </div>

          {/* Date */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground-muted">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-4 py-3 bg-background-secondary border border-border rounded-xl text-foreground focus:border-cpsc/50"
            />
          </div>

          {/* Reschedule Quick Actions (edit mode only) */}
          {mode === "edit" && onReschedule && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground-muted">Quick Actions</label>
              <div className="flex gap-2">
                <button
                  onClick={handleRescheduleToTomorrow}
                  className="flex-1 px-3 py-2 rounded-xl bg-ece/10 border border-ece/20 text-ece text-sm font-medium hover:bg-ece/20 transition-colors"
                >
                  Move to Tomorrow
                </button>
                {date !== (initialTask?.date || initialDate) && (
                  <button
                    onClick={handleRescheduleToDate}
                    className="flex-1 px-3 py-2 rounded-xl bg-cpsc/10 border border-cpsc/20 text-cpsc text-sm font-medium hover:bg-cpsc/20 transition-colors"
                  >
                    Move to {formatDateShort(date)}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center gap-3 p-4 border-t border-border">
          {mode === "edit" && onDelete && (
            <button
              onClick={() => {
                onDelete();
                onClose();
              }}
              className="px-4 py-2 rounded-xl bg-accent-red/10 border border-accent-red/20 text-accent-red text-sm font-medium hover:bg-accent-red/20 transition-colors"
            >
              Delete
            </button>
          )}
          <div className="flex-1" />
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-background-secondary border border-border text-foreground-secondary text-sm font-medium hover:bg-background-tertiary transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!description.trim()}
            className={cn(
              "px-4 py-2 rounded-xl text-sm font-medium transition-colors",
              description.trim()
                ? "bg-cpsc text-white hover:bg-cpsc/90"
                : "bg-background-tertiary text-foreground-muted cursor-not-allowed"
            )}
          >
            {mode === "create" ? "Add Task" : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
