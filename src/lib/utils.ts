import { Course, courseInfo } from "@/data/schedule";

// Date formatting utilities
export function formatDate(dateStr: string): string {
  const date = new Date(dateStr + "T12:00:00");
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

export function formatDateShort(dateStr: string): string {
  const date = new Date(dateStr + "T12:00:00");
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export function formatDateCompact(dateStr: string): string {
  const date = new Date(dateStr + "T12:00:00");
  return date.toLocaleDateString("en-US", {
    month: "numeric",
    day: "numeric",
  });
}

export function getDayOfWeek(dateStr: string): string {
  const date = new Date(dateStr + "T12:00:00");
  return date.toLocaleDateString("en-US", { weekday: "short" });
}

export function getDayNumber(dateStr: string): number {
  const date = new Date(dateStr + "T12:00:00");
  return date.getDate();
}

export function getMonthYear(dateStr: string): string {
  const date = new Date(dateStr + "T12:00:00");
  return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

// Get today's date in YYYY-MM-DD format
export function getTodayString(): string {
  const today = new Date();
  return today.toISOString().split("T")[0];
}

// Check if a date is today
export function isToday(dateStr: string): boolean {
  return dateStr === getTodayString();
}

// Check if a date is in the past
export function isPast(dateStr: string): boolean {
  const today = getTodayString();
  return dateStr < today;
}

// Check if a date is in the future
export function isFuture(dateStr: string): boolean {
  const today = getTodayString();
  return dateStr > today;
}

// Get days until a date
export function getDaysUntil(dateStr: string): number {
  const today = new Date(getTodayString() + "T12:00:00");
  const target = new Date(dateStr + "T12:00:00");
  const diff = target.getTime() - today.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

// Get relative date string
export function getRelativeDate(dateStr: string): string {
  const days = getDaysUntil(dateStr);
  if (days === 0) return "Today";
  if (days === 1) return "Tomorrow";
  if (days === -1) return "Yesterday";
  if (days < -1) return `${Math.abs(days)} days ago`;
  if (days < 7) return `In ${days} days`;
  return formatDateShort(dateStr);
}

// Course color utilities
export function getCourseColorClasses(course: Course): {
  bg: string;
  border: string;
  text: string;
  badge: string;
} {
  const color = courseInfo[course].color;
  return {
    bg: `bg-${color}-bg`,
    border: `border-${color}-border`,
    text: `text-${color}`,
    badge: `bg-${color}/10 text-${color} border-${color}/20`,
  };
}

// Generate array of dates between start and end
export function getDateRange(start: string, end: string): string[] {
  const dates: string[] = [];
  const current = new Date(start + "T12:00:00");
  const endDate = new Date(end + "T12:00:00");

  while (current <= endDate) {
    dates.push(current.toISOString().split("T")[0]);
    current.setDate(current.getDate() + 1);
  }

  return dates;
}

// Group dates by week
export function groupDatesByWeek(dates: string[]): string[][] {
  const weeks: string[][] = [];
  let currentWeek: string[] = [];

  dates.forEach((dateStr) => {
    const date = new Date(dateStr + "T12:00:00");
    const dayOfWeek = date.getDay();

    // Start new week on Sunday
    if (dayOfWeek === 0 && currentWeek.length > 0) {
      weeks.push(currentWeek);
      currentWeek = [];
    }

    currentWeek.push(dateStr);
  });

  if (currentWeek.length > 0) {
    weeks.push(currentWeek);
  }

  return weeks;
}

// CN utility for conditional classnames
export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(" ");
}
