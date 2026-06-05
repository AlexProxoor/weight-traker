import CalendarGrid from './CalendarGrid';

export type HabitKind = 'evening' | 'chips';

const HABIT_COPY: Record<HabitKind, { title: string }> = {
  evening: {
    title: 'Не есть после 6 веч.',
  },
  chips: {
    title: 'Не есть чипсы',
  },
};

export interface TrackerMonthColumnProps {
  year: number;
  month: number;
  habitKind: HabitKind;
  okDays: Set<string>;
  onToggleOk: (dateKey: string) => void;
  onBack?: () => void;
}

function daysInMonth(y: number, m: number) {
  return new Date(y, m + 1, 0).getDate();
}

const TrackerMonthColumn = ({
  year,
  month,
  habitKind,
  okDays,
  onToggleOk,
  onBack,
}: TrackerMonthColumnProps) => {
  const copy = HABIT_COPY[habitKind];
  const n = daysInMonth(year, month);
  const okCount = Array.from({ length: n }, (_, i) => `${year}-${month}-${i + 1}`).filter((k) =>
    okDays.has(k)
  ).length;

  return (
    <>
      {onBack && (
        <div className="evening-journal-nav-row evening-journal-nav-row--back">
          <button type="button" className="evening-journal-tab" onClick={onBack}>
            ← К календарю
          </button>
        </div>
      )}
      <div className="calendar-header evening-journal-header evening-journal-header--compact">
        <h2 className="evening-journal-title">{copy.title}</h2>
        <p className="evening-tracker-stats">
          За месяц отмечено: <strong>{okCount}</strong> из {n}
        </p>
      </div>
      <div className="evening-journal-body evening-journal-body--trackers-days">
        <div className="evening-tracker-panel evening-tracker-panel--calendar">
          <CalendarGrid
            year={year}
            month={month}
            markedDays={okDays}
            selectedDate={null}
            onDayClick={onToggleOk}
            onDayDoubleClick={() => {}}
            hideMonthTitle
            habitTracker
          />
        </div>
      </div>
    </>
  );
};

export default TrackerMonthColumn;
