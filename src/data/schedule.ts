// Finals Prep Schedule - Spring 2026
// Edit this file to update your study plan

export type Course = "CPSC 4520" | "ECE 3101" | "MENG 3323";

export interface Task {
  id: string;
  course: Course;
  description: string;
}

export interface DaySchedule {
  date: string; // Format: "2026-04-18"
  tasks: Task[];
  isExamDay?: boolean;
  examCourse?: Course;
}

export interface ExamInfo {
  course: Course;
  date: string;
  name: string;
}

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

// Helper to generate unique task IDs
const taskId = (date: string, course: Course, index: number) =>
  `${date}-${course.replace(/\s/g, "-")}-${index}`;

// Study schedule
export const schedule: DaySchedule[] = [
  {
    date: "2026-04-18",
    tasks: [
      { id: taskId("2026-04-18", "CPSC 4520", 0), course: "CPSC 4520", description: "Lectures 1 through 5" },
      { id: taskId("2026-04-18", "ECE 3101", 0), course: "ECE 3101", description: "Weeks 7, 8 lecture notes" },
      { id: taskId("2026-04-18", "MENG 3323", 0), course: "MENG 3323", description: "Lecture 16" },
    ],
  },
  {
    date: "2026-04-19",
    tasks: [
      { id: taskId("2026-04-19", "CPSC 4520", 0), course: "CPSC 4520", description: "Lectures 6, 7, 8" },
      { id: taskId("2026-04-19", "ECE 3101", 0), course: "ECE 3101", description: "Weeks 9, 10" },
    ],
  },
  {
    date: "2026-04-20",
    tasks: [
      { id: taskId("2026-04-20", "CPSC 4520", 0), course: "CPSC 4520", description: "Lectures 9, 10" },
    ],
  },
  {
    date: "2026-04-21",
    tasks: [
      { id: taskId("2026-04-21", "CPSC 4520", 0), course: "CPSC 4520", description: "Lecture 11" },
      { id: taskId("2026-04-21", "MENG 3323", 0), course: "MENG 3323", description: "Lecture 18" },
    ],
  },
  {
    date: "2026-04-22",
    tasks: [
      { id: taskId("2026-04-22", "CPSC 4520", 0), course: "CPSC 4520", description: "Lecture 12" },
    ],
  },
  {
    date: "2026-04-23",
    tasks: [
      { id: taskId("2026-04-23", "CPSC 4520", 0), course: "CPSC 4520", description: "Lectures 13, 14" },
      { id: taskId("2026-04-23", "MENG 3323", 0), course: "MENG 3323", description: "Lecture 19" },
    ],
  },
  {
    date: "2026-04-24",
    tasks: [
      { id: taskId("2026-04-24", "CPSC 4520", 0), course: "CPSC 4520", description: "Lectures 15, 16" },
      { id: taskId("2026-04-24", "ECE 3101", 0), course: "ECE 3101", description: "Weeks 1–5 lecture notes review" },
      { id: taskId("2026-04-24", "MENG 3323", 0), course: "MENG 3323", description: "Lecture 20" },
    ],
  },
  {
    date: "2026-04-25",
    tasks: [
      { id: taskId("2026-04-25", "CPSC 4520", 0), course: "CPSC 4520", description: "Lectures 17, 18 + start final exam practice PDF" },
      { id: taskId("2026-04-25", "ECE 3101", 0), course: "ECE 3101", description: "Week 6 review" },
      { id: taskId("2026-04-25", "MENG 3323", 0), course: "MENG 3323", description: "Exam 2 weaknesses" },
    ],
  },
  {
    date: "2026-04-26",
    tasks: [
      { id: taskId("2026-04-26", "CPSC 4520", 0), course: "CPSC 4520", description: "Lectures 19, 20 + final exam practice PDF" },
      { id: taskId("2026-04-26", "MENG 3323", 0), course: "MENG 3323", description: "Exam 1 + Exam 2 weaknesses (earlier psets as well)" },
    ],
  },
  {
    date: "2026-04-27",
    tasks: [
      { id: taskId("2026-04-27", "CPSC 4520", 0), course: "CPSC 4520", description: "Lecture 21 + Deep Learning weaknesses + revisiting Mock questions + final exam questions" },
    ],
  },
  {
    date: "2026-04-28",
    tasks: [
      { id: taskId("2026-04-28", "CPSC 4520", 0), course: "CPSC 4520", description: "Lecture 22 + Deep Learning weaknesses + revisiting Mock questions + final exam questions" },
    ],
  },
  {
    date: "2026-04-29",
    tasks: [
      { id: taskId("2026-04-29", "CPSC 4520", 0), course: "CPSC 4520", description: "Deep Learning weaknesses + revisiting Mock questions + final exam questions" },
    ],
  },
  {
    date: "2026-04-30",
    tasks: [
      { id: taskId("2026-04-30", "CPSC 4520", 0), course: "CPSC 4520", description: "Deep Learning weaknesses + revisiting Mock questions + final exam questions" },
    ],
  },
  // TBD Days - May 1-5 (exam period)
  {
    date: "2026-05-01",
    tasks: [],
    isExamDay: true,
    examCourse: "CPSC 4520",
  },
  {
    date: "2026-05-02",
    tasks: [
      { id: taskId("2026-05-02", "MENG 3323", 0), course: "MENG 3323", description: "TBD — Final review" },
      { id: taskId("2026-05-02", "ECE 3101", 0), course: "ECE 3101", description: "TBD — Final review" },
    ],
  },
  {
    date: "2026-05-03",
    tasks: [
      { id: taskId("2026-05-03", "MENG 3323", 0), course: "MENG 3323", description: "TBD — Final review" },
      { id: taskId("2026-05-03", "ECE 3101", 0), course: "ECE 3101", description: "TBD — Final review" },
    ],
  },
  {
    date: "2026-05-04",
    tasks: [],
    isExamDay: true,
    examCourse: "MENG 3323",
  },
  {
    date: "2026-05-05",
    tasks: [],
    isExamDay: true,
    examCourse: "ECE 3101",
  },
];

// Get schedule for a specific date
export function getScheduleForDate(date: string): DaySchedule | undefined {
  return schedule.find((s) => s.date === date);
}

// Get all dates in the schedule range
export function getScheduleDateRange(): { start: Date; end: Date } {
  const dates = schedule.map((s) => new Date(s.date));
  return {
    start: new Date(Math.min(...dates.map((d) => d.getTime()))),
    end: new Date(Math.max(...dates.map((d) => d.getTime()))),
  };
}

// Check if a date has an exam
export function getExamForDate(date: string): ExamInfo | undefined {
  return exams.find((e) => e.date === date);
}
