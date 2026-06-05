import JournalMonthNav from './JournalMonthNav';
import TrackerMonthColumn from './TrackerMonthColumn';

interface TrackersViewProps {
  year: number;
  month: number;
  onMonthChange: (month: number) => void;
  onBack: () => void;
  eveningOkDays: Set<string>;
  onToggleEvening: (dateKey: string) => void;
  chipsOkDays: Set<string>;
  onToggleChips: (dateKey: string) => void;
}

const TrackersView = ({
  year,
  month,
  onMonthChange,
  onBack,
  eveningOkDays,
  onToggleEvening,
  chipsOkDays,
  onToggleChips,
}: TrackersViewProps) => {
  return (
    <div className="journal-spread journal-spread--trackers">
      <div className="trackers-inner">
        <JournalMonthNav month={month} onMonthChange={onMonthChange} />
        <div className="trackers-columns">
          <div className="left-page evening-journal-page">
            <TrackerMonthColumn
              year={year}
              month={month}
              habitKind="evening"
              okDays={eveningOkDays}
              onToggleOk={onToggleEvening}
              onBack={onBack}
            />
          </div>
          <div className="right-page evening-journal-page">
            <div className="evening-journal-nav-spacer" aria-hidden />
            <TrackerMonthColumn
              year={year}
              month={month}
              habitKind="chips"
              okDays={chipsOkDays}
              onToggleOk={onToggleChips}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrackersView;
