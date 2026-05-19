import { format, differenceInDays, isAfter, isBefore } from 'date-fns';

export function formatDate(date: string | Date, pattern = 'PPP'): string {
  if (!date) return '-';
  const d = typeof date === 'string' ? new Date(date) : date;
  return format(d, pattern);
}

export function getDaysRemaining(dueDateStr: string): number {
  const dueDate = new Date(dueDateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  dueDate.setHours(0, 0, 0, 0);
  
  return differenceInDays(dueDate, today);
}

export function isOverdue(dueDateStr: string): boolean {
  const dueDate = new Date(dueDateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  dueDate.setHours(0, 0, 0, 0);
  
  return isBefore(dueDate, today);
}
