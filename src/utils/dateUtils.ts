
import { format, differenceInDays, getDaysInMonth as getLibDaysInMonth, isToday as isLibToday } from 'date-fns';

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
 * Calculates and formats conversion lag information
 * @param offerDate Original offer date
 * @param conversionDate Date when offer was converted
 * @returns Object with text, icon element, and fast flag
 */
export const getConversionLagInfo = (offerDate: Date | string, conversionDate: Date | string) => {
  const startDate = typeof offerDate === 'string' ? new Date(offerDate) : offerDate;
  const endDate = typeof conversionDate === 'string' ? new Date(conversionDate) : conversionDate;
  
  const days = differenceInDays(endDate, startDate);
  
  if (days === 0) {
    return { 
      text: "Same day", 
      lagDays: 0,
      isFast: true 
    };
  } else if (days <= 3) {
    return { 
      text: `in ${days} day${days > 1 ? 's' : ''}`, 
      lagDays: days,
      isFast: true 
    };
  } else if (days > 7) {
    return { 
      text: `in ${days} days`, 
      lagDays: days,
      isFast: false 
    };
  } else {
    return { 
      text: `in ${days} days`, 
      lagDays: days,
      isFast: false 
    };
  }
};

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
