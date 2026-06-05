import { useState, useCallback, useEffect, useRef } from 'react';
import CalendarGrid from './components/CalendarGrid';
import DayInfo from './components/DayInfo';
import MonthOverview from './components/MonthOverview';
import TrackersView from './components/TrackersView';
import JournalMonthNav from './components/JournalMonthNav';
import {
  JOURNAL_YEAR,
  monthOverviewStorageKey,
  MONTH_NAMES_NOM,
} from './constants/journalMonths';
import type { DayData, MonthOverviewData, SportItem } from './types';
import { Download, Upload } from 'lucide-react';
import './App.css';

function normalizeMonthOverview(raw: unknown): MonthOverviewData {
  if (!raw || typeof raw !== 'object') {
    return {
      initialWeightKg: '',
      targetWeightKg: '',
      week1WeightKg: '',
      week2WeightKg: '',
      week3WeightKg: '',
      week4WeightKg: '',
    };
  }
  const o = raw as Record<string, unknown>;
  const str = (v: unknown) => (v == null ? '' : String(v));
  const legacyWeek1 = str(o.firstWeekEndWeightKg);
  return {
    initialWeightKg: str(o.initialWeightKg),
    targetWeightKg: str(o.targetWeightKg),
    week1WeightKg: str(o.week1WeightKg) || legacyWeek1,
    week2WeightKg: str(o.week2WeightKg),
    week3WeightKg: str(o.week3WeightKg),
    week4WeightKg: str(o.week4WeightKg),
  };
}

function App() {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [markedDays, setMarkedDays] = useState<Set<string>>(new Set());
  const [daysData, setDaysData] = useState<Map<string, DayData>>(new Map());
  const [monthOverview, setMonthOverview] = useState<MonthOverviewData>(() =>
    normalizeMonthOverview(undefined)
  );
  const [lightEveningDays, setLightEveningDays] = useState<Set<string>>(new Set());
  const [noChipsDays, setNoChipsDays] = useState<Set<string>>(new Set());
  const [appView, setAppView] = useState<'journal' | 'trackers'>('journal');
  const [isLoading, setIsLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(4);
  const overviewMonthRef = useRef(currentMonth);

  const currentYear = JOURNAL_YEAR;
  const overviewStorageKey = monthOverviewStorageKey(currentYear, currentMonth);

  const migrateSportData = (data: DayData): DayData => {
    if (data.sportList) {
      const migratedSportList: SportItem[] = data.sportList.map((sport: any) => ({
        ...sport,
        exercises: sport.exercises || [],
        isExpanded: sport.isExpanded || false,
      }));
      return { ...data, sportList: migratedSportList };
    }
    return data;
  };

  // Загрузка из localStorage
  useEffect(() => {
    try {
      const savedMarkedDays = localStorage.getItem('weightTracker_markedDays');
      const savedDaysData = localStorage.getItem('weightTracker_daysData');

      if (savedMarkedDays) {
        const parsed = JSON.parse(savedMarkedDays);
        setMarkedDays(new Set(parsed));
      }

      if (savedDaysData) {
        const parsed = JSON.parse(savedDaysData);
        const migratedData = parsed.map(([key, value]: [string, any]) => [
          key,
          migrateSportData(value as DayData),
        ]);
        const dataMap = new Map<string, DayData>(migratedData);
        setDaysData(dataMap);
        console.log('Загружено дней:', dataMap.size);
      }

      const savedEvening = localStorage.getItem('weightTracker_lightEveningDays');
      if (savedEvening) {
        const arr = JSON.parse(savedEvening) as unknown;
        if (Array.isArray(arr)) {
          setLightEveningDays(new Set(arr.filter((x): x is string => typeof x === 'string')));
        }
      }

      const savedChips = localStorage.getItem('weightTracker_noChipsDays');
      if (savedChips) {
        const arr = JSON.parse(savedChips) as unknown;
        if (Array.isArray(arr)) {
          setNoChipsDays(new Set(arr.filter((x): x is string => typeof x === 'string')));
        }
      }
    } catch (error) {
      console.error('Ошибка загрузки:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isLoading) return;
    try {
      const savedOverview = localStorage.getItem(overviewStorageKey);
      if (savedOverview) {
        setMonthOverview(normalizeMonthOverview(JSON.parse(savedOverview)));
      } else {
        setMonthOverview(normalizeMonthOverview(undefined));
      }
      overviewMonthRef.current = currentMonth;
    } catch (error) {
      console.error('Ошибка загрузки обзора месяца:', error);
      setMonthOverview(normalizeMonthOverview(undefined));
      overviewMonthRef.current = currentMonth;
    }
  }, [currentMonth, isLoading, overviewStorageKey]);

  // Сохранение в localStorage
  useEffect(() => {
    if (!isLoading) {
      const markedArray = Array.from(markedDays);
      localStorage.setItem('weightTracker_markedDays', JSON.stringify(markedArray));
    }
  }, [markedDays, isLoading]);

  useEffect(() => {
    if (!isLoading && overviewMonthRef.current === currentMonth) {
      localStorage.setItem(overviewStorageKey, JSON.stringify(monthOverview));
    }
  }, [monthOverview, isLoading, overviewStorageKey, currentMonth]);

  useEffect(() => {
    if (!isLoading) {
      const dataArray = Array.from(daysData.entries());
      localStorage.setItem('weightTracker_daysData', JSON.stringify(dataArray));
    }
  }, [daysData, isLoading]);

  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem(
        'weightTracker_lightEveningDays',
        JSON.stringify(Array.from(lightEveningDays))
      );
    }
  }, [lightEveningDays, isLoading]);

  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem('weightTracker_noChipsDays', JSON.stringify(Array.from(noChipsDays)));
    }
  }, [noChipsDays, isLoading]);

  // Экспорт данных в файл
  const exportData = () => {
    const exportObject = {
      markedDays: Array.from(markedDays),
      daysData: Array.from(daysData.entries()),
      monthOverview,
      monthOverviewKey: overviewStorageKey,
      lightEveningDays: Array.from(lightEveningDays),
      noChipsDays: Array.from(noChipsDays),
      exportDate: new Date().toISOString(),
      version: '1.4',
    };

    const dataStr = JSON.stringify(exportObject, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `weight-tracker-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Импорт данных из файла
  const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const imported = JSON.parse(content);

        if (imported.markedDays) {
          setMarkedDays(new Set(imported.markedDays));
        }

        if (imported.daysData) {
          const migratedData = imported.daysData.map(([key, value]: [string, any]) => [
            key,
            migrateSportData(value as DayData),
          ]);
          const dataMap = new Map<string, DayData>(migratedData);
          setDaysData(dataMap);
        }

        if (imported.monthOverview && typeof imported.monthOverview === 'object') {
          setMonthOverview(normalizeMonthOverview(imported.monthOverview));
        }

        if (Array.isArray(imported.lightEveningDays)) {
          setLightEveningDays(
            new Set(imported.lightEveningDays.filter((x: unknown) => typeof x === 'string'))
          );
        }

        if (Array.isArray(imported.noChipsDays)) {
          setNoChipsDays(
            new Set(imported.noChipsDays.filter((x: unknown) => typeof x === 'string'))
          );
        }

        alert('✅ Данные успешно импортированы!');
        // Очищаем input
        event.target.value = '';
      } catch (error) {
        console.error('Ошибка импорта:', error);
        alert('❌ Ошибка при импорте файла');
      }
    };
    reader.readAsText(file);
  };

  const handleDayClick = useCallback((dateKey: string) => {
    setSelectedDate(dateKey);
  }, []);

  const handleDayDoubleClick = useCallback((dateKey: string) => {
    setMarkedDays(prev => {
      const newMarked = new Set(prev);
      if (newMarked.has(dateKey)) {
        newMarked.delete(dateKey);
      } else {
        newMarked.add(dateKey);
      }
      return newMarked;
    });
  }, []);

  const saveDayData = useCallback((dateKey: string, data: DayData) => {
    setDaysData(prev => {
      const newMap = new Map(prev);
      newMap.set(dateKey, data);
      return newMap;
    });
  }, []);

  const getCurrentDayData = useCallback((): DayData | undefined => {
    if (!selectedDate) return undefined;
    const data = daysData.get(selectedDate);
    if (data) {
      return migrateSportData(data);
    }
    return undefined;
  }, [selectedDate, daysData]);

  const toggleLightEvening = useCallback((dateKey: string) => {
    setLightEveningDays((prev) => {
      const next = new Set(prev);
      if (next.has(dateKey)) next.delete(dateKey);
      else next.add(dateKey);
      return next;
    });
  }, []);

  const handleMonthChange = useCallback((month: number) => {
    setCurrentMonth(month);
    setSelectedDate(null);
  }, []);

  const toggleNoChips = useCallback((dateKey: string) => {
    setNoChipsDays((prev) => {
      const next = new Set(prev);
      if (next.has(dateKey)) next.delete(dateKey);
      else next.add(dateKey);
      return next;
    });
  }, []);

  if (isLoading) {
    return (
      <div className="app">
        <div className="loading">Загрузка... 💜</div>
      </div>
    );
  }

  if (appView === 'trackers') {
    return (
      <div className="app">
        <TrackersView
          year={currentYear}
          month={currentMonth}
          onMonthChange={handleMonthChange}
          onBack={() => setAppView('journal')}
          eveningOkDays={lightEveningDays}
          onToggleEvening={toggleLightEvening}
          chipsOkDays={noChipsDays}
          onToggleChips={toggleNoChips}
        />
      </div>
    );
  }

  return (
    <div className="app">
      <div className="journal-spread">
        <div className="left-page">
          <div className="calendar-header">
            <h2
              className="calendar-month-title"
              onClick={() => setSelectedDate(null)}
              role="button"
              tabIndex={0}
              title="Вернуться к стартовой странице месяца"
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setSelectedDate(null);
                }
              }}
            >
              {MONTH_NAMES_NOM[currentMonth]} {currentYear}
            </h2>
            <JournalMonthNav month={currentMonth} onMonthChange={handleMonthChange} />
            <div className="calendar-nav">
              <button
                type="button"
                className="calendar-nav-text-link"
                onClick={() => {
                  setAppView('trackers');
                }}
              >
                Трекеры
              </button>
            </div>
            <div className="backup-buttons">
              <button onClick={exportData} className="backup-btn" title="Экспорт данных">
                <Download size={18} /> Сохранить
              </button>
              <label className="backup-btn" title="Импорт данных">
                <Upload size={18} /> Загрузить
                <input
                  type="file"
                  accept=".json"
                  onChange={importData}
                  style={{ display: 'none' }}
                />
              </label>
            </div>
          </div>
          <CalendarGrid
            year={currentYear}
            month={currentMonth}
            markedDays={markedDays}
            selectedDate={selectedDate}
            onDayClick={handleDayClick}
            onDayDoubleClick={handleDayDoubleClick}
          />
        </div>

        <div className="right-page">
          {selectedDate ? (
            <DayInfo
              key={selectedDate}
              dateKey={selectedDate}
              initialData={getCurrentDayData()}
              onSave={saveDayData}
            />
          ) : (
            <MonthOverview data={monthOverview} onChange={setMonthOverview} />
          )}
        </div>
      </div>
    </div>
  );
}

export default App;