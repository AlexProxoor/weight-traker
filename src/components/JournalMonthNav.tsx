import { JOURNAL_MONTHS, MONTH_NAMES_NOM } from '../constants/journalMonths';

interface JournalMonthNavProps {
  month: number;
  onMonthChange: (month: number) => void;
}

const JournalMonthNav = ({ month, onMonthChange }: JournalMonthNavProps) => {
  return (
    <div className="calendar-nav calendar-nav--months" role="tablist" aria-label="Месяц">
      {JOURNAL_MONTHS.map((m) => (
        <button
          key={m}
          type="button"
          role="tab"
          aria-selected={month === m}
          className={`app-nav-link${month === m ? ' app-nav-link--active' : ''}`}
          onClick={() => onMonthChange(m)}
        >
          {MONTH_NAMES_NOM[m]}
        </button>
      ))}
    </div>
  );
};

export default JournalMonthNav;
