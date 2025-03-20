/**
 * Generates a random date between the start and end dates (inclusive)
 * @param start The starting date
 * @param end The ending date
 * @returns A random date between start and end
 */
export function randomDate(start: Date, end: Date): Date {
  // Get the time difference in milliseconds
  const timeDiff = end.getTime() - start.getTime();
  
  // Generate a random number between 0 and the time difference
  const randomTime = Math.random() * timeDiff;
  
  // Create a new date by adding the random time to the start date
  const result = new Date(start.getTime() + randomTime);
  
  return result;
}

/**
 * Formats a date as YYYY-MM-DD
 * @param date The date to format
 * @returns The formatted date string
 */
export function formatDateYYYYMMDD(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
}

/**
 * Returns today's date at midnight
 */
export function today(): Date {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return now;
}

/**
 * Returns a date that is the specified number of days from today
 * @param days Number of days from today (can be negative for past dates)
 */
export function daysFromToday(days: number): Date {
  const result = today();
  result.setDate(result.getDate() + days);
  return result;
} 