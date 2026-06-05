export const JOURNAL_YEAR = 2026;

/** Май, июнь, июль (0-based) */
export const JOURNAL_MONTHS = [4, 5, 6] as const;

export type JournalMonth = (typeof JOURNAL_MONTHS)[number];

export const MONTH_NAMES_NOM = [
  'Январь',
  'Февраль',
  'Март',
  'Апрель',
  'Май',
  'Июнь',
  'Июль',
  'Август',
  'Сентябрь',
  'Октябрь',
  'Ноябрь',
  'Декабрь',
] as const;

export function monthOverviewStorageKey(year: number, month: number) {
  return `weightTracker_monthOverview_${year}-${month}`;
}
