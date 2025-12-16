/**
 * ISO Week utilities for week-based meal planning
 * ISO weeks run Monday-Sunday, with week 1 containing January 4th
 */

export interface ISOWeek {
  year: number;
  week: number;
}

/**
 * Get ISO week from a date
 * Based on ISO 8601 standard: Week 1 is the week containing January 4th
 */
export function getISOWeek(date: Date): ISOWeek {
  // Create a copy to avoid mutating the original
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7; // Convert Sunday (0) to 7
  d.setUTCDate(d.getUTCDate() + 4 - dayNum); // Set to Thursday of current week
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  
  let year = d.getUTCFullYear();
  
  // Handle edge case where week belongs to previous or next year
  if (weekNo === 0) {
    year--;
    const prevYearStart = new Date(Date.UTC(year, 0, 1));
    const prevYearThursday = new Date(Date.UTC(year, 0, 1 + (4 - prevYearStart.getUTCDay() || 7)));
    const weekCount = Math.ceil((((d.getTime() - prevYearStart.getTime()) / 86400000) + 1) / 7);
    return { year, week: weekCount || 52 };
  }
  
  // Check if week belongs to next year
  const nextYear = year + 1;
  const nextYearStart = new Date(Date.UTC(nextYear, 0, 1));
  const nextYearThursday = new Date(Date.UTC(nextYear, 0, 1 + (4 - nextYearStart.getUTCDay() || 7)));
  if (d.getTime() >= nextYearThursday.getTime()) {
    return { year: nextYear, week: 1 };
  }
  
  return { year, week: weekNo };
}

/**
 * Convert ISO week to a string key format: "YYYY-Www"
 */
export function getISOWeekKey(date: Date): string {
  const { year, week } = getISOWeek(date);
  return `${year}-W${week.toString().padStart(2, '0')}`;
}

/**
 * Parse an ISO week key string to ISOWeek object
 * @param key Format: "YYYY-Www" or "YYYY-Ww"
 */
export function parseISOWeekKey(key: string): ISOWeek {
  const match = key.match(/^(\d{4})-W(\d{1,2})$/);
  if (!match) {
    throw new Error(`Invalid ISO week key format: ${key}. Expected format: YYYY-Www`);
  }
  return {
    year: parseInt(match[1], 10),
    week: parseInt(match[2], 10)
  };
}

/**
 * Get the start date (Monday) of an ISO week
 */
export function getWeekStartDate(year: number, week: number): Date {
  const simple = new Date(year, 0, 1 + (week - 1) * 7);
  const dow = simple.getDay();
  const ISOweekStart = simple;
  if (dow <= 4) {
    ISOweekStart.setDate(simple.getDate() - simple.getDay() + 1);
  } else {
    ISOweekStart.setDate(simple.getDate() + 8 - simple.getDay());
  }
  return ISOweekStart;
}

/**
 * Get the end date (Sunday) of an ISO week
 */
export function getWeekEndDate(year: number, week: number): Date {
  const start = getWeekStartDate(year, week);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  return end;
}

/**
 * Format week range as "Jan 6-12, 2025"
 */
export function formatWeekRange(year: number, week: number): string {
  const start = getWeekStartDate(year, week);
  const end = getWeekEndDate(year, week);
  
  const startMonth = start.toLocaleDateString('en-US', { month: 'short' });
  const startDay = start.getDate();
  const endMonth = end.toLocaleDateString('en-US', { month: 'short' });
  const endDay = end.getDate();
  const yearStr = end.getFullYear();
  
  if (startMonth === endMonth) {
    return `${startMonth} ${startDay}-${endDay}, ${yearStr}`;
  } else {
    return `${startMonth} ${startDay} - ${endMonth} ${endDay}, ${yearStr}`;
  }
}

/**
 * Format week range without year as "Jan 6-12" or "Dec 30 - Jan 5"
 */
export function formatWeekRangeWithoutYear(year: number, week: number): string {
  const start = getWeekStartDate(year, week);
  const end = getWeekEndDate(year, week);
  
  const startMonth = start.toLocaleDateString('en-US', { month: 'short' });
  const startDay = start.getDate();
  const endMonth = end.toLocaleDateString('en-US', { month: 'short' });
  const endDay = end.getDate();
  
  if (startMonth === endMonth) {
    return `${startMonth} ${startDay}-${endDay}`;
  } else {
    return `${startMonth} ${startDay} - ${endMonth} ${endDay}`;
  }
}

/**
 * Get the previous week key
 */
export function getPreviousWeek(weekKey: string): string {
  const { year, week } = parseISOWeekKey(weekKey);
  if (week === 1) {
    // Previous week is last week of previous year
    const prevYear = year - 1;
    // Check if previous year has 52 or 53 weeks
    const lastWeekOfPrevYear = getLastWeekOfYear(prevYear);
    return `${prevYear}-W${lastWeekOfPrevYear.toString().padStart(2, '0')}`;
  }
  return `${year}-W${(week - 1).toString().padStart(2, '0')}`;
}

/**
 * Get the next week key
 */
export function getNextWeek(weekKey: string): string {
  const { year, week } = parseISOWeekKey(weekKey);
  const lastWeek = getLastWeekOfYear(year);
  if (week === lastWeek) {
    // Next week is first week of next year
    return `${year + 1}-W01`;
  }
  return `${year}-W${(week + 1).toString().padStart(2, '0')}`;
}

/**
 * Get the current week key
 */
export function getCurrentWeekKey(): string {
  return getISOWeekKey(new Date());
}

/**
 * Get the last week number of a year (52 or 53)
 */
function getLastWeekOfYear(year: number): number {
  // Week 53 exists if January 1st is a Thursday, or if it's a leap year and January 1st is a Wednesday
  const jan1 = new Date(year, 0, 1);
  const jan4 = new Date(year, 0, 4);
  let jan1Day = jan4.getDay() - 3; // Monday = 0
  if (jan1Day < 0) jan1Day += 7;
  
  // Check if year has 53 weeks
  const dec31 = new Date(year, 11, 31);
  const week53Start = getWeekStartDate(year + 1, 1);
  if (week53Start.getTime() <= dec31.getTime()) {
    return 52; // Year doesn't have week 53
  }
  
  // Year has 53 weeks if Jan 1 is Thursday, or (leap year and Jan 1 is Wednesday)
  const isLeapYear = (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
  const jan1Weekday = jan1.getDay();
  if (jan1Weekday === 4 || (isLeapYear && jan1Weekday === 3)) {
    return 53;
  }
  
  return 52;
}

/**
 * Check if a week key represents the current week
 */
export function isCurrentWeek(weekKey: string): boolean {
  return weekKey === getCurrentWeekKey();
}

/**
 * Check if a week key represents a past week
 */
export function isPastWeek(weekKey: string): boolean {
  const current = getCurrentWeekKey();
  const { year: currentYear, week: currentWeek } = parseISOWeekKey(current);
  const { year, week } = parseISOWeekKey(weekKey);
  
  if (year < currentYear) return true;
  if (year > currentYear) return false;
  return week < currentWeek;
}

/**
 * Check if a week key represents a future week
 */
export function isFutureWeek(weekKey: string): boolean {
  return !isCurrentWeek(weekKey) && !isPastWeek(weekKey);
}

/**
 * Compare two week keys (for sorting)
 * Returns -1 if a < b, 0 if a === b, 1 if a > b
 */
export function compareWeekKeys(a: string, b: string): number {
  const weekA = parseISOWeekKey(a);
  const weekB = parseISOWeekKey(b);
  
  if (weekA.year !== weekB.year) {
    return weekA.year - weekB.year;
  }
  return weekA.week - weekB.week;
}

/**
 * Get all week keys in a range (inclusive)
 */
export function getWeekKeysInRange(startKey: string, endKey: string): string[] {
  const keys: string[] = [];
  let current = startKey;
  
  while (compareWeekKeys(current, endKey) <= 0) {
    keys.push(current);
    if (current === endKey) break;
    current = getNextWeek(current);
  }
  
  return keys;
}

