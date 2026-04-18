// Finals Prep Schedule - Spring 2026
// Course metadata and exam info (tasks now stored in Firebase)

export type Course = "CPSC 4520" | "ECE 3101" | "MENG 3323";

export type TaskStatus = "Not started" | "Next up" | "In progress" | "Lesno";

export interface Subtask {
  id: string;
  description: string;
  completed: boolean;
  createdAt: number;
}

export interface Task {
  id: string;
  course: Course;
  description: string;
  date: string;
  createdAt: number;
  status: TaskStatus;
  subtasks: Subtask[];
}

export interface ExamInfo {
  course: Course;
  date: string;
  name: string;
}

// Status metadata for display
export const statusInfo: Record<TaskStatus, { label: string; color: string; bgColor: string }> = {
  "Not started": { label: "Not started", color: "text-foreground-muted", bgColor: "bg-foreground-muted/10" },
  "Next up": { label: "Next up", color: "text-ece", bgColor: "bg-ece/10" },
  "In progress": { label: "In progress", color: "text-cpsc", bgColor: "bg-cpsc/10" },
  "Lesno": { label: "Lesno", color: "text-accent-green", bgColor: "bg-accent-green/10" },
};

// Course metadata for display
export const courseInfo: Record<Course, { name: string; shortName: string; color: string; icon: string }> = {
  "CPSC 4520": {
    name: "CPSC 4520",
    shortName: "CPSC",
    color: "cpsc",
    icon: "cpu",
  },
  "ECE 3101": {
    name: "ECE 3101",
    shortName: "ECE",
    color: "ece",
    icon: "zap",
  },
  "MENG 3323": {
    name: "MENG 3323",
    shortName: "MENG",
    color: "meng",
    icon: "settings",
  },
};

// Exam dates
export const exams: ExamInfo[] = [
  { course: "CPSC 4520", date: "2026-05-01", name: "CPSC 4520 Final" },
  { course: "MENG 3323", date: "2026-05-04", name: "MENG 3323 Final" },
  { course: "ECE 3101", date: "2026-05-05", name: "ECE 3101 Final" },
];

// Schedule date range
export const scheduleDates = {
  start: "2026-04-18",
  end: "2026-05-05",
};

// Get all dates in the schedule range
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

// Check if a date has an exam
export function getExamForDate(date: string): ExamInfo | undefined {
  return exams.find((e) => e.date === date);
}

// Initial seed data for first-time setup
export const initialTasks: Omit<Task, "id">[] = [
  // April 18
  { date: "2026-04-18", course: "CPSC 4520", description: "Lectures 1 through 5", createdAt: 1, status: "Not started", subtasks: [] },
  { date: "2026-04-18", course: "ECE 3101", description: "Weeks 7, 8 lecture notes", createdAt: 2, status: "Not started", subtasks: [] },
  { date: "2026-04-18", course: "MENG 3323", description: "Lecture 16", createdAt: 3, status: "Not started", subtasks: [] },
  // April 19
  { date: "2026-04-19", course: "CPSC 4520", description: "Lectures 6, 7, 8", createdAt: 4, status: "Not started", subtasks: [] },
  { date: "2026-04-19", course: "ECE 3101", description: "Weeks 9, 10", createdAt: 5, status: "Not started", subtasks: [] },
  // April 20
  { date: "2026-04-20", course: "CPSC 4520", description: "Lectures 9, 10", createdAt: 6, status: "Not started", subtasks: [] },
  // April 21
  { date: "2026-04-21", course: "CPSC 4520", description: "Lecture 11", createdAt: 7, status: "Not started", subtasks: [] },
  { date: "2026-04-21", course: "MENG 3323", description: "Lecture 18", createdAt: 8, status: "Not started", subtasks: [] },
  // April 22
  { date: "2026-04-22", course: "CPSC 4520", description: "Lecture 12", createdAt: 9, status: "Not started", subtasks: [] },
  // April 23
  { date: "2026-04-23", course: "CPSC 4520", description: "Lectures 13, 14", createdAt: 10, status: "Not started", subtasks: [] },
  { date: "2026-04-23", course: "MENG 3323", description: "Lecture 19", createdAt: 11, status: "Not started", subtasks: [] },
  // April 24
  { date: "2026-04-24", course: "CPSC 4520", description: "Lectures 15, 16", createdAt: 12, status: "Not started", subtasks: [] },
  { date: "2026-04-24", course: "ECE 3101", description: "Weeks 1–5 lecture notes review", createdAt: 13, status: "Not started", subtasks: [] },
  { date: "2026-04-24", course: "MENG 3323", description: "Lecture 20", createdAt: 14, status: "Not started", subtasks: [] },
  // April 25
  { date: "2026-04-25", course: "CPSC 4520", description: "Lectures 17, 18 + start final exam practice PDF", createdAt: 15, status: "Not started", subtasks: [] },
  { date: "2026-04-25", course: "ECE 3101", description: "Week 6 review", createdAt: 16, status: "Not started", subtasks: [] },
  { date: "2026-04-25", course: "MENG 3323", description: "Exam 2 weaknesses", createdAt: 17, status: "Not started", subtasks: [] },
  // April 26
  { date: "2026-04-26", course: "CPSC 4520", description: "Lectures 19, 20 + final exam practice PDF", createdAt: 18, status: "Not started", subtasks: [] },
  { date: "2026-04-26", course: "MENG 3323", description: "Exam 1 + Exam 2 weaknesses (earlier psets as well)", createdAt: 19, status: "Not started", subtasks: [] },
  // April 27
  { date: "2026-04-27", course: "CPSC 4520", description: "Lecture 21 + Deep Learning weaknesses + revisiting Mock questions + final exam questions", createdAt: 20, status: "Not started", subtasks: [] },
  // April 28
  { date: "2026-04-28", course: "CPSC 4520", description: "Lecture 22 + Deep Learning weaknesses + revisiting Mock questions + final exam questions", createdAt: 21, status: "Not started", subtasks: [] },
  // April 29
  { date: "2026-04-29", course: "CPSC 4520", description: "Deep Learning weaknesses + revisiting Mock questions + final exam questions", createdAt: 22, status: "Not started", subtasks: [] },
  // April 30
  { date: "2026-04-30", course: "CPSC 4520", description: "Deep Learning weaknesses + revisiting Mock questions + final exam questions", createdAt: 23, status: "Not started", subtasks: [] },
  // May 2
  { date: "2026-05-02", course: "MENG 3323", description: "TBD — Final review", createdAt: 24, status: "Not started", subtasks: [] },
  { date: "2026-05-02", course: "ECE 3101", description: "TBD — Final review", createdAt: 25, status: "Not started", subtasks: [] },
  // May 3
  { date: "2026-05-03", course: "MENG 3323", description: "TBD — Final review", createdAt: 26, status: "Not started", subtasks: [] },
  { date: "2026-05-03", course: "ECE 3101", description: "TBD — Final review", createdAt: 27, status: "Not started", subtasks: [] },
];
