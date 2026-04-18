"use client";

import { Task, courseInfo, Course } from "@/data/schedule";
import { cn } from "@/lib/utils";
import { CourseIcon, CheckIcon, ClockIcon } from "./Icons";

interface TaskItemProps {
  task: Task;
  isCompleted: boolean;
  isOverdue: boolean;
  onToggle: () => void;
}

const courseGlowClass: Record<Course, string> = {
  "CPSC 4520": "glow-cpsc",
  "ECE 3101": "glow-ece",
  "MENG 3323": "glow-meng",
};

export function TaskItem({ task, isCompleted, isOverdue, onToggle }: TaskItemProps) {
  const course = courseInfo[task.course];

  return (
    <div
      className={cn(
        "group flex items-start gap-3 p-4 rounded-xl border transition-all duration-200",
        isCompleted
          ? "bg-background-secondary/60 border-border-subtle opacity-75"
          : isOverdue
          ? "bg-accent-red/5 border-accent-red/20"
          : `bg-${course.color}-bg border-${course.color}-border ${courseGlowClass[task.course]}`
      )}
    >
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
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1.5">
          <span
            className={cn(
              "inline-flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-lg",
              isCompleted
                ? "bg-foreground-muted/10 text-foreground-muted"
                : `bg-${course.color}/15 text-${course.color}`
            )}
          >
            <CourseIcon course={task.course} className="w-3 h-3" />
            {course.shortName}
          </span>
          {isOverdue && !isCompleted && (
            <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-lg bg-accent-red/10 text-accent-red">
              <ClockIcon className="w-3 h-3" />
              Overdue
            </span>
          )}
        </div>
        <p
          className={cn(
            "text-sm leading-relaxed",
            isCompleted ? "text-foreground-muted line-through decoration-foreground-muted/50" : "text-foreground"
          )}
        >
          {task.description}
        </p>
      </div>
    </div>
  );
}
