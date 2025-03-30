import { format, differenceInDays, getDaysInMonth as getLibDaysInMonth, isToday as isLibToday, isValid, parseISO } from 'date-fns';
import { Zap, Clock } from 'lucide-react';
import React from 'react';

/**
 * Combines a date and time string into a single Date object
 * @param date The date (can be Date object or ISO string)
 * @param timeString Time in format "HH:MM"
 * @returns A new Date object with combined date and time
 */
export const combineDateAndTime = (date: Date | string, timeString: string): Date => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const [hours, minutes] = timeString.split(':').map(Number);
  
  const result = new Date(dateObj);
  result.setHours(hours, minutes, 0, 0);
  
  return result;
};

/**
 * Gets current time as a string in "HH:MM" format
 */
export const getCurrentTimeString = (): string => {
  const now = new Date();
  return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
};

/**
 * Formats a date for display in the follow-up UI
 */
export const formatFollowupDate = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return format(dateObj, 'PPP');
};

/**
 * Formats a date for storing as a follow-up date (YYYY-MM-DD)
 */
export const formatDateForStorage = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

/**
 * Gets a default follow-up time (9:00 AM)
 */
export const getDefaultFollowupTime = (): string => {
  return "09:00";
};

/**
 * Get conversion lag information for UI display
 */
export function getConversionLagInfo(offerDate: string, conversionDate: string | undefined) {
  if (!conversionDate) return null;
  
  const startDate = parseISO(offerDate);
  const endDate = parseISO(conversionDate);
  const lagDays = differenceInDays(endDate, startDate);

  if (lagDays === 0) {
    return { text: "Same day", iconType: "zap", iconColor: "amber", fast: true };
  } else if (lagDays <= 3) {
    return { text: `in ${lagDays} day${lagDays > 1 ? 's' : ''}`, iconType: "zap", iconColor: "amber", fast: true };
  } else if (lagDays > 7) {
    return { text: `in ${lagDays} days`, iconType: "clock", iconColor: "blue", fast: false };
  } else {
    return { text: `in ${lagDays} days`, iconType: "clock", iconColor: "green", fast: false };
  }
}

/**
 * Returns today's date as YYYY-MM-DD
 */
export const getTodayDateString = (): string => {
  return new Date().toISOString().split('T')[0];
};

/**
 * Check if a date is today
 */
export const isToday = (date: Date | string): boolean => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return isLibToday(dateObj);
};

/**
 * Gets the number of days in a given month
 * @param month Month index (0-11)
 * @param year Full year (e.g., 2023)
 * @returns Number of days in the month
 */
export const getDaysInMonth = (month: number, year: number): number => {
  return getLibDaysInMonth(new Date(year, month));
};

/**
 * Gets the number of days that have passed in the current month
 * @returns Number of days passed including today
 */
export const getDaysPassedInCurrentMonth = (): number => {
  const today = new Date();
  return today.getDate();
};

/**
 * Safely converts a date to ISO string without timezone problems
 * This function ensures the correct date is preserved
 */
export const toISODateString = (date: Date): string => {
  // Create a new date object in the local timezone
  const localDate = new Date(date);
  
  // Get year, month, and day
  const year = localDate.getFullYear();
  const month = String(localDate.getMonth() + 1).padStart(2, '0');
  const day = String(localDate.getDate()).padStart(2, '0');
  
  // Return date in YYYY-MM-DD format
  return `${year}-${month}-${day}`;
};
