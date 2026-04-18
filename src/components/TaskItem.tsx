"use client";

import { useState } from "react";
import { Task, courseInfo, Course, statusInfo, Subtask } from "@/data/schedule";
import { cn } from "@/lib/utils";
import { CourseIcon, CheckIcon, ClockIcon } from "./Icons";

interface TaskItemProps {
  task: Task;
  isCompleted: boolean;
  isOverdue: boolean;
  onToggle: () => void;
  onToggleSubtask?: (subtaskId: string) => void;
  onAddSubtask?: (description: string) => void;
  onEditTask?: () => void;
}

const courseGlowClass: Record<Course, string> = {
  "CPSC 4520": "glow-cpsc",
  "ECE 3101": "glow-ece",
  "MENG 3323": "glow-meng",
};

export function TaskItem({ task, isCompleted, isOverdue, onToggle, onToggleSubtask, onAddSubtask, onEditTask }: TaskItemProps) {
  const [showSubtasks, setShowSubtasks] = useState(true);
  const [isAddingSubtask, setIsAddingSubtask] = useState(false);
  const [newSubtaskText, setNewSubtaskText] = useState("");

  const course = courseInfo[task.course];
  const status = statusInfo[task.status];
  const completedSubtasks = task.subtasks.filter((st) => st.completed).length;
  const totalSubtasks = task.subtasks.length;
  const hasSubtasks = totalSubtasks > 0;

  const handleAddSubtask = () => {
    if (!newSubtaskText.trim() || !onAddSubtask) return;
    onAddSubtask(newSubtaskText.trim());
    setNewSubtaskText("");
    setIsAddingSubtask(false);
  };

  return (
    <div
      className={cn(
        "group flex flex-col gap-2 p-4 rounded-xl border transition-all duration-200",
        isCompleted || task.status === "Lesno"
          ? "bg-background-secondary/60 border-border-subtle opacity-75"
          : isOverdue
          ? "bg-accent-red/5 border-accent-red/20"
          : `bg-${course.color}-bg border-${course.color}-border ${courseGlowClass[task.course]}`
      )}
    >
      <div className="flex items-start gap-3">
        {/* Checkbox */}
        <button
          onClick={onToggle}
          className={cn(
            "mt-0.5 w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all duration-200 flex-shrink-0",
            isCompleted
              ? "bg-accent-green border-accent-green"
              : isOverdue
              ? "border-accent-red/50 hover:border-accent-red hover:bg-accent-red/10"
              : `border-${course.color}/40 hover:border-${course.color} hover:bg-${course.color}/10`
          )}
        >
          {isCompleted && <CheckIcon className="text-white checkbox-done" />}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0" onClick={onEditTask} role={onEditTask ? "button" : undefined}>
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span
              className={cn(
                "inline-flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-lg",
                isCompleted || task.status === "Lesno"
                  ? "bg-foreground-muted/10 text-foreground-muted"
                  : `bg-${course.color}/15 text-${course.color}`
              )}
            >
              <CourseIcon course={task.course} className="w-3 h-3" />
              {course.shortName}
            </span>
            {/* Status Badge */}
            <span
              className={cn(
                "inline-flex items-center text-xs font-medium px-2 py-1 rounded-lg",
                status.bgColor,
                status.color
              )}
            >
              {status.label}
            </span>
            {isOverdue && !isCompleted && task.status !== "Lesno" && (
              <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-lg bg-accent-red/10 text-accent-red">
                <ClockIcon className="w-3 h-3" />
                Overdue
              </span>
            )}
          </div>
          <p
            className={cn(
              "text-sm leading-relaxed cursor-pointer hover:text-foreground-secondary transition-colors",
              isCompleted || task.status === "Lesno" ? "text-foreground-muted line-through decoration-foreground-muted/50" : "text-foreground"
            )}
          >
            {task.description}
          </p>
        </div>
      </div>

      {/* Subtasks Section */}
      <div className="ml-8 space-y-1.5">
        {/* Subtask Header with Toggle */}
        {hasSubtasks && (
          <div className="flex items-center gap-2 mb-2">
            <button
              onClick={() => setShowSubtasks(!showSubtasks)}
              className="flex items-center gap-1 text-xs text-foreground-muted hover:text-foreground transition-colors"
            >
              <svg
                className={cn("w-3 h-3 transition-transform", showSubtasks ? "rotate-90" : "")}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
              Subtasks
            </button>
            <div className="flex-1 h-1.5 bg-background-tertiary rounded-full overflow-hidden">
              <div
                className="h-full bg-accent-green transition-all duration-300"
                style={{ width: `${totalSubtasks > 0 ? (completedSubtasks / totalSubtasks) * 100 : 0}%` }}
              />
            </div>
            <span className="text-xs text-foreground-muted">{completedSubtasks}/{totalSubtasks}</span>
          </div>
        )}

        {/* Subtask List */}
        {showSubtasks && task.subtasks.map((subtask) => (
          <div
            key={subtask.id}
            className="flex items-center gap-2 group/subtask"
          >
            <button
              onClick={() => onToggleSubtask?.(subtask.id)}
              className={cn(
                "w-4 h-4 rounded border flex items-center justify-center transition-all duration-200 flex-shrink-0",
                subtask.completed
                  ? "bg-accent-green border-accent-green"
                  : "border-foreground-muted/40 hover:border-foreground-muted hover:bg-foreground-muted/10"
              )}
            >
              {subtask.completed && <CheckIcon className="w-2.5 h-2.5 text-white" />}
            </button>
            <span
              className={cn(
                "text-xs leading-relaxed",
                subtask.completed ? "text-foreground-muted line-through" : "text-foreground-secondary"
              )}
            >
              {subtask.description}
            </span>
          </div>
        ))}

        {/* Add Subtask */}
        {isAddingSubtask ? (
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={newSubtaskText}
              onChange={(e) => setNewSubtaskText(e.target.value)}
              placeholder="Enter subtask..."
              className="flex-1 px-2 py-1 text-xs bg-background-secondary border border-border rounded-lg text-foreground placeholder:text-foreground-muted/60 focus:border-cpsc/50"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") handleAddSubtask();
                if (e.key === "Escape") {
                  setIsAddingSubtask(false);
                  setNewSubtaskText("");
                }
              }}
            />
            <button
              onClick={handleAddSubtask}
              disabled={!newSubtaskText.trim()}
              className={cn(
                "px-2 py-1 rounded-lg text-xs font-medium transition-colors",
                newSubtaskText.trim()
                  ? "bg-accent-green/10 text-accent-green hover:bg-accent-green/20"
                  : "bg-background-tertiary text-foreground-muted cursor-not-allowed"
              )}
            >
              Add
            </button>
            <button
              onClick={() => {
                setIsAddingSubtask(false);
                setNewSubtaskText("");
              }}
              className="px-2 py-1 rounded-lg text-xs font-medium bg-background-tertiary text-foreground-muted hover:text-foreground transition-colors"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={() => setIsAddingSubtask(true)}
            className="flex items-center gap-1 text-xs text-foreground-muted hover:text-cpsc transition-colors py-1"
          >
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Add subtask
          </button>
        )}
      </div>
    </div>
  );
}
