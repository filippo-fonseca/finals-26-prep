"use client";

import { useState } from "react";
import { User } from "firebase/auth";
import { schedule, getExamForDate, courseInfo, DaySchedule } from "@/data/schedule";
import { useAppState } from "@/hooks/useLocalStorage";
import { TaskItem } from "./TaskItem";
import {
  formatDate,
  getMonthYear,
  getDayOfWeek,
  getDayNumber,
  isToday,
  isPast,
  isFuture,
  getDateRange,
  cn,
} from "@/lib/utils";

interface CalendarViewProps {
  user: User;
}

export function CalendarView({ user }: CalendarViewProps) {
  const { isLoaded, toggleTask, updateNotes, updateReflection, getDayProgress, isTaskCompleted } =
    useAppState(user);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // Get all dates in the range
  const startDate = schedule[0]?.date || "2026-04-18";
  const endDate = schedule[schedule.length - 1]?.date || "2026-05-05";
  const allDates = getDateRange(startDate, endDate);

  // Group by weeks (starting Sunday)
  const getWeeks = () => {
    const weeks: string[][] = [];
    let currentWeek: string[] = [];

    // Pad the first week with empty days
    const firstDate = new Date(startDate + "T12:00:00");
    const firstDayOfWeek = firstDate.getDay();
    for (let i = 0; i < firstDayOfWeek; i++) {
      currentWeek.push("");
    }

    allDates.forEach((date) => {
      const dayOfWeek = new Date(date + "T12:00:00").getDay();
      if (dayOfWeek === 0 && currentWeek.length > 0) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
      currentWeek.push(date);
    });

    // Pad the last week
    while (currentWeek.length < 7) {
      currentWeek.push("");
    }
    if (currentWeek.length > 0) {
      weeks.push(currentWeek);
    }

    return weeks;
  };

  const weeks = getWeeks();

  const getCompletionStats = (day: DaySchedule | undefined) => {
    if (!day) return { completed: 0, total: 0, percentage: 0 };
    const total = day.tasks.length;
    if (total === 0) return { completed: 0, total: 0, percentage: 100 };
    const completed = day.tasks.filter((task) => isTaskCompleted(task.id, day.date)).length;
    return { completed, total, percentage: Math.round((completed / total) * 100) };
  };

  const getDayData = (date: string) => {
    return schedule.find((d) => d.date === date);
  };

  const selectedDay = selectedDate ? getDayData(selectedDate) : null;
  const selectedExam = selectedDate ? getExamForDate(selectedDate) : null;
  const selectedDayProgress = selectedDate ? getDayProgress(selectedDate) : null;

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-pulse text-foreground-muted">Loading...</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar Grid */}
        <div className="lg:col-span-2">
          <div className="bg-background-secondary border border-border rounded-2xl p-4 sm:p-6">
            {/* Month Header */}
            <h2 className="text-xl font-medium text-foreground mb-6">
              {getMonthYear(startDate)} - {getMonthYear(endDate)}
            </h2>

            {/* Day Headers */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div
                  key={day}
                  className="text-center text-xs font-medium text-foreground-muted uppercase tracking-wider py-2"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="space-y-1">
              {weeks.map((week, weekIndex) => (
                <div key={weekIndex} className="grid grid-cols-7 gap-1">
                  {week.map((date, dayIndex) => {
                    if (!date) {
                      return <div key={`empty-${dayIndex}`} className="aspect-square" />;
                    }

                    const dayData = getDayData(date);
                    const stats = getCompletionStats(dayData);
                    const exam = getExamForDate(date);
                    const dayIsToday = isToday(date);
                    const dayIsPast = isPast(date);
                    const isSelected = selectedDate === date;
                    const hasOverdue = dayIsPast && stats.total > 0 && stats.percentage < 100;

                    return (
                      <button
                        key={date}
                        onClick={() => setSelectedDate(isSelected ? null : date)}
                        className={cn(
                          "aspect-square p-1.5 rounded-xl border-2 transition-all duration-200 flex flex-col items-center justify-center gap-0.5 hover-lift",
                          isSelected
                            ? "bg-cpsc/10 border-cpsc scale-105 z-10"
                            : dayIsToday
                            ? "bg-background border-cpsc/50 ring-2 ring-cpsc/20"
                            : exam
                            ? "bg-amber-500/10 border-amber-500/30 hover:border-amber-500/50"
                            : hasOverdue
                            ? "bg-red-500/5 border-red-500/20 hover:border-red-500/40"
                            : stats.percentage === 100 && stats.total > 0
                            ? "bg-green-500/5 border-green-500/20 hover:border-green-500/40"
                            : "bg-background border-border hover:border-foreground-muted"
                        )}
                      >
                        <span
                          className={cn(
                            "text-sm font-medium",
                            isSelected
                              ? "text-cpsc"
                              : dayIsToday
                              ? "text-foreground"
                              : dayIsPast
                              ? "text-foreground-muted"
                              : "text-foreground-secondary"
                          )}
                        >
                          {getDayNumber(date)}
                        </span>

                        {/* Status indicator */}
                        {exam ? (
                          <div className="w-2 h-2 rounded-full bg-amber-500" />
                        ) : stats.total > 0 ? (
                          <div className="flex gap-0.5">
                            {dayData?.tasks.slice(0, 3).map((task, i) => (
                              <div
                                key={i}
                                className={cn(
                                  "w-1.5 h-1.5 rounded-full",
                                  isTaskCompleted(task.id, date)
                                    ? "bg-green-500"
                                    : dayIsPast
                                    ? "bg-red-400"
                                    : `bg-${courseInfo[task.course].color}`
                                )}
                              />
                            ))}
                          </div>
                        ) : null}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>

            {/* Legend */}
            <div className="mt-6 pt-4 border-t border-border">
              <div className="flex flex-wrap gap-4 text-xs text-foreground-muted">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-cpsc" />
                  <span>CPSC 4520</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-ece" />
                  <span>ECE 3101</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-meng" />
                  <span>MENG 3323</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-amber-500" />
                  <span>Exam Day</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  <span>Completed</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <span>Overdue</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Day Details Panel */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 bg-background-secondary border border-border rounded-2xl p-4 sm:p-6">
            {selectedDate && selectedDay ? (
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium text-foreground">
                    {formatDate(selectedDate)}
                  </h3>
                  {isToday(selectedDate) && (
                    <span className="inline-block mt-1 text-xs font-medium px-2 py-0.5 rounded-full bg-cpsc/10 text-cpsc">
                      Today
                    </span>
                  )}
                </div>

                {/* Exam banner */}
                {selectedExam && (
                  <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30">
                    <div className="flex items-center gap-2">
                      <svg
                        className="w-4 h-4 text-amber-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                        />
                      </svg>
                      <span className="text-sm font-medium text-amber-600 dark:text-amber-400">
                        {selectedExam.name}
                      </span>
                    </div>
                  </div>
                )}

                {/* Tasks */}
                {selectedDay.tasks.length > 0 && (
                  <div className="space-y-2">
                    {selectedDay.tasks.map((task) => (
                      <TaskItem
                        key={task.id}
                        task={task}
                        isCompleted={isTaskCompleted(task.id, selectedDate)}
                        isOverdue={isPast(selectedDate) && !isTaskCompleted(task.id, selectedDate)}
                        onToggle={() => toggleTask(task.id, selectedDate)}
                      />
                    ))}
                  </div>
                )}

                {/* No tasks */}
                {selectedDay.tasks.length === 0 && !selectedExam && (
                  <p className="text-sm text-foreground-muted py-4 text-center">
                    No tasks scheduled
                  </p>
                )}

                {/* Notes */}
                <div className="pt-4 border-t border-border">
                  <label className="block text-xs font-medium text-foreground-muted uppercase tracking-wider mb-2">
                    Notes
                  </label>
                  <textarea
                    value={selectedDayProgress?.notes || ""}
                    onChange={(e) => updateNotes(selectedDate, e.target.value)}
                    placeholder="Add notes..."
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground placeholder:text-foreground-muted resize-none focus:border-cpsc/50"
                    rows={2}
                  />
                </div>

                {/* Reflection for past days */}
                {isPast(selectedDate) && (
                  <div>
                    <label className="block text-xs font-medium text-foreground-muted uppercase tracking-wider mb-2">
                      Reflection
                    </label>
                    <textarea
                      value={selectedDayProgress?.reflection || ""}
                      onChange={(e) => updateReflection(selectedDate, e.target.value)}
                      placeholder="What went well?"
                      className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground placeholder:text-foreground-muted resize-none focus:border-cpsc/50"
                      rows={2}
                    />
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <svg
                  className="w-12 h-12 mx-auto mb-4 text-foreground-muted/30"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <p className="text-foreground-muted">Select a day to view details</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
