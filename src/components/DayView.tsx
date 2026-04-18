"use client";

import { useRef, useEffect, useState } from "react";
import { User } from "firebase/auth";
import { schedule, getExamForDate, courseInfo, DaySchedule, Task, Course } from "@/data/schedule";
import { useAppState, CustomTask } from "@/hooks/useLocalStorage";
import { TaskItem } from "./TaskItem";
import { TaskModal } from "./TaskModal";
import { BookIcon, PencilIcon, SparklesIcon, MoonIcon, FireIcon, TrophyIcon } from "./Icons";
import {
  formatDate,
  formatDateShort,
  isToday,
  isPast,
  isFuture,
  getRelativeDate,
  cn,
} from "@/lib/utils";

interface DayViewProps {
  user: User;
}

export function DayView({ user }: DayViewProps) {
  const {
    isLoaded,
    toggleTask,
    updateNotes,
    updateReflection,
    getDayProgress,
    isTaskCompleted,
    addCustomTask,
    updateCustomTask,
    deleteCustomTask,
    rescheduleCustomTask,
    getCustomTasksForDate,
    getCustomTaskById,
  } = useAppState(user);

  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const dayRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);

  // Find today's index or closest future day
  useEffect(() => {
    if (!isLoaded) return;
    const todayIndex = schedule.findIndex((day) => isToday(day.date));
    if (todayIndex >= 0) {
      setSelectedIndex(todayIndex);
    } else {
      const futureIndex = schedule.findIndex((day) => isFuture(day.date));
      setSelectedIndex(futureIndex >= 0 ? futureIndex : schedule.length - 1);
    }
  }, [isLoaded]);

  // Scroll to selected day
  useEffect(() => {
    const ref = dayRefs.current[selectedIndex];
    if (ref && scrollContainerRef.current) {
      ref.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
    }
  }, [selectedIndex]);

  const selectedDay = schedule[selectedIndex];
  const exam = selectedDay ? getExamForDate(selectedDay.date) : undefined;
  const dayProgress = selectedDay ? getDayProgress(selectedDay.date) : null;
  const customTasks = selectedDay ? getCustomTasksForDate(selectedDay.date) : [];

  // Combine schedule tasks with custom tasks
  const allTasks: (Task | CustomTask)[] = [
    ...(selectedDay?.tasks || []),
    ...customTasks,
  ];

  const getCompletionStats = (day: DaySchedule, customTasksForDay: CustomTask[]) => {
    const allTasksForDay = [...day.tasks, ...customTasksForDay];
    const total = allTasksForDay.length;
    if (total === 0) return { completed: 0, total: 0, percentage: 100 };
    const completed = allTasksForDay.filter((task) => isTaskCompleted(task.id, day.date)).length;
    return { completed, total, percentage: Math.round((completed / total) * 100) };
  };

  const openCreateModal = () => {
    setModalMode("create");
    setEditingTaskId(null);
    setModalOpen(true);
  };

  const openEditModal = (taskId: string) => {
    setModalMode("edit");
    setEditingTaskId(taskId);
    setModalOpen(true);
  };

  const handleSaveTask = (task: Omit<Task, "id">, date: string) => {
    if (modalMode === "create") {
      addCustomTask({ ...task, date });
    } else if (editingTaskId) {
      updateCustomTask(editingTaskId, { ...task, date });
    }
  };

  const handleDeleteTask = () => {
    if (editingTaskId) {
      deleteCustomTask(editingTaskId);
    }
  };

  const handleRescheduleTask = (newDate: string) => {
    if (editingTaskId) {
      rescheduleCustomTask(editingTaskId, newDate);
    }
  };

  const editingTask = editingTaskId ? getCustomTaskById(editingTaskId) : undefined;

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-pulse text-foreground-muted">Loading...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
      {/* Day Navigation */}
      <div className="mb-8">
        <div
          ref={scrollContainerRef}
          className="flex gap-2 overflow-x-auto pb-3 -mx-4 px-4 sm:-mx-6 sm:px-6 scrollbar-hide"
        >
          {schedule.map((day, index) => {
            const customTasksForDay = getCustomTasksForDate(day.date);
            const stats = getCompletionStats(day, customTasksForDay);
            const dayIsToday = isToday(day.date);
            const dayIsPast = isPast(day.date);
            const hasExam = getExamForDate(day.date);
            const isSelected = index === selectedIndex;

            return (
              <button
                key={day.date}
                ref={(el) => { dayRefs.current[index] = el; }}
                onClick={() => setSelectedIndex(index)}
                className={cn(
                  "flex-shrink-0 flex flex-col items-center p-3 rounded-2xl border transition-all duration-200 min-w-[76px]",
                  isSelected
                    ? "bg-cpsc-bg border-cpsc-border scale-105 shadow-sm"
                    : dayIsToday
                    ? "bg-background-secondary border-cpsc/30 hover:border-cpsc/60"
                    : hasExam
                    ? "bg-exam-bg/50 border-exam-border/50 hover:border-exam-border"
                    : dayIsPast && stats.percentage < 100
                    ? "bg-accent-red/5 border-accent-red/20 hover:border-accent-red/40"
                    : stats.percentage === 100 && stats.total > 0
                    ? "bg-accent-green/5 border-accent-green/20 hover:border-accent-green/40"
                    : "bg-background-secondary/60 border-border/50 hover:border-border"
                )}
              >
                <span
                  className={cn(
                    "text-[10px] font-medium uppercase tracking-wider",
                    isSelected ? "text-cpsc" : "text-foreground-muted"
                  )}
                >
                  {formatDateShort(day.date).split(" ")[0]}
                </span>
                <span
                  className={cn(
                    "text-lg font-medium my-0.5",
                    isSelected
                      ? "text-cpsc"
                      : dayIsToday
                      ? "text-foreground"
                      : hasExam
                      ? "text-exam"
                      : dayIsPast
                      ? "text-foreground-muted"
                      : "text-foreground-secondary"
                  )}
                >
                  {new Date(day.date + "T12:00:00").getDate()}
                </span>
                {hasExam ? (
                  <span className="flex items-center gap-0.5 text-[9px] font-medium text-exam">
                    <FireIcon className="w-2.5 h-2.5" />
                    EXAM
                  </span>
                ) : stats.total > 0 ? (
                  <div className="flex items-center gap-1 mt-0.5">
                    <div className="w-8 h-1.5 bg-border/50 rounded-full overflow-hidden">
                      <div
                        className={cn(
                          "h-full rounded-full transition-all duration-300",
                          stats.percentage === 100
                            ? "bg-accent-green"
                            : dayIsPast
                            ? "bg-accent-red"
                            : "bg-cpsc"
                        )}
                        style={{ width: `${stats.percentage}%` }}
                      />
                    </div>
                  </div>
                ) : (
                  <span className="text-[9px] text-foreground-muted/60">—</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Day Details */}
      {selectedDay && (
        <div className="space-y-6">
          {/* Day Header */}
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-medium text-foreground">{formatDate(selectedDay.date)}</h2>
                {isToday(selectedDay.date) && (
                  <span className="flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-lg bg-cpsc/10 text-cpsc">
                    <SparklesIcon className="w-3 h-3" />
                    Today
                  </span>
                )}
              </div>
              <p className="text-foreground-muted mt-1">{getRelativeDate(selectedDay.date)}</p>
            </div>
            {(() => {
              const stats = getCompletionStats(selectedDay, customTasks);
              return (
                <div className="flex items-center gap-3">
                  {stats.total > 0 && (
                    <div className="text-right">
                      <div className={cn(
                        "text-2xl font-medium",
                        stats.percentage === 100 ? "text-accent-green" : "text-foreground"
                      )}>
                        {stats.percentage}%
                      </div>
                      <div className="text-sm text-foreground-muted">
                        {stats.completed}/{stats.total} done
                      </div>
                    </div>
                  )}
                  {/* Add Task Button */}
                  <button
                    onClick={openCreateModal}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl bg-cpsc/10 border border-cpsc/20 text-cpsc text-sm font-medium hover:bg-cpsc/20 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                    Add
                  </button>
                </div>
              );
            })()}
          </div>

          {/* Exam Banner */}
          {exam && (
            <div className="p-5 rounded-2xl bg-exam-bg border border-exam-border">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-exam/20 flex items-center justify-center">
                  <TrophyIcon className="w-6 h-6 text-exam" />
                </div>
                <div>
                  <h3 className="font-medium text-exam">{exam.name}</h3>
                  <p className="text-sm text-exam/70">Exam Day — You've got this!</p>
                </div>
              </div>
            </div>
          )}

          {/* Tasks */}
          {allTasks.length > 0 && (
            <div className="space-y-3">
              <h3 className="flex items-center gap-2 text-sm font-medium text-foreground-muted uppercase tracking-wider">
                <BookIcon className="w-4 h-4" />
                Study Tasks
              </h3>
              <div className="space-y-2">
                {allTasks.map((task) => {
                  const isCustom = task.id.startsWith("custom-");
                  return (
                    <div
                      key={task.id}
                      className={cn(isCustom && "cursor-pointer")}
                      onClick={() => isCustom && openEditModal(task.id)}
                    >
                      <TaskItem
                        task={task}
                        isCompleted={isTaskCompleted(task.id, selectedDay.date)}
                        isOverdue={isPast(selectedDay.date) && !isTaskCompleted(task.id, selectedDay.date)}
                        onToggle={() => toggleTask(task.id, selectedDay.date)}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* No tasks */}
          {allTasks.length === 0 && !exam && (
            <div className="text-center py-16">
              <MoonIcon className="w-12 h-12 mx-auto mb-4 text-foreground-muted/40" />
              <p className="text-lg font-medium text-foreground-muted">Rest day</p>
              <p className="text-sm text-foreground-muted/70 mb-4">No tasks scheduled</p>
              <button
                onClick={openCreateModal}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-cpsc/10 border border-cpsc/20 text-cpsc text-sm font-medium hover:bg-cpsc/20 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                Add a Task
              </button>
            </div>
          )}

          {/* Notes Section */}
          <div className="space-y-3">
            <h3 className="flex items-center gap-2 text-sm font-medium text-foreground-muted uppercase tracking-wider">
              <PencilIcon className="w-4 h-4" />
              Notes
            </h3>
            <textarea
              value={dayProgress?.notes || ""}
              onChange={(e) => updateNotes(selectedDay.date, e.target.value)}
              placeholder="Add notes for this day..."
              className="w-full px-4 py-3 bg-background-secondary/60 border border-border/50 rounded-xl text-foreground placeholder:text-foreground-muted/60 resize-none focus:border-cpsc/50 focus:bg-background-secondary"
              rows={3}
            />
          </div>

          {/* Reflection Section (for past days) */}
          {isPast(selectedDay.date) && (
            <div className="space-y-3">
              <h3 className="flex items-center gap-2 text-sm font-medium text-foreground-muted uppercase tracking-wider">
                <SparklesIcon className="w-4 h-4" />
                Reflection
              </h3>
              <textarea
                value={dayProgress?.reflection || ""}
                onChange={(e) => updateReflection(selectedDay.date, e.target.value)}
                placeholder="What went well? What could be improved?"
                className="w-full px-4 py-3 bg-background-secondary/60 border border-border/50 rounded-xl text-foreground placeholder:text-foreground-muted/60 resize-none focus:border-cpsc/50 focus:bg-background-secondary"
                rows={3}
              />
            </div>
          )}
        </div>
      )}

      {/* Task Modal */}
      <TaskModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSaveTask}
        onDelete={modalMode === "edit" ? handleDeleteTask : undefined}
        onReschedule={modalMode === "edit" ? handleRescheduleTask : undefined}
        initialTask={editingTask ? { id: editingTask.id, course: editingTask.course, description: editingTask.description } : undefined}
        initialDate={editingTask?.date || selectedDay?.date || ""}
        mode={modalMode}
      />
    </div>
  );
}
