import type { MonthOverviewData } from '../types';

interface MonthOverviewProps {
  data: MonthOverviewData;
  onChange: (data: MonthOverviewData) => void;
}

function parseKg(s: string): number | null {
  const t = s.replace(',', '.').trim();
  if (!t) return null;
  const n = parseFloat(t);
  return Number.isFinite(n) && n > 0 ? n : null;
}

function getWeekDelta(
  initial: number,
  week: number
): { text: string; tone: 'loss' | 'gain' | 'neutral' } | null {
  const d = initial - week;
  if (Math.abs(d) < 0.05) return { text: 'без изменений от старта', tone: 'neutral' };
  if (d > 0) return { text: `сбросила ${d.toFixed(1)} кг`, tone: 'loss' };
  return { text: `+${Math.abs(d).toFixed(1)} кг к старту`, tone: 'gain' };
}

const MonthOverview = ({ data, onChange }: MonthOverviewProps) => {
  const patch = (partial: Partial<MonthOverviewData>) => {
    onChange({ ...data, ...partial });
  };

  const initial = parseKg(data.initialWeightKg);

  const weekRow = (
    weekNum: 1 | 2 | 3 | 4,
    field: 'week1WeightKg' | 'week2WeightKg' | 'week3WeightKg' | 'week4WeightKg'
  ) => {
    const w = parseKg(data[field]);
    const delta =
      initial !== null && w !== null ? getWeekDelta(initial, w) : null;

    return (
      <div className="month-overview-row month-overview-row--week" key={weekNum}>
        <div className="month-overview-label-wrap">
          <span className="month-overview-wk-num" aria-hidden>
            {weekNum}
          </span>
          <span className="month-overview-label">Итог {weekNum} недели</span>
        </div>
        <div className="month-overview-value-wrap">
          <input
            type="text"
            inputMode="decimal"
            className="month-overview-input"
            aria-label={`Вес на конец ${weekNum} недели, кг`}
            value={data[field]}
            onChange={(e) => patch({ [field]: e.target.value } as Partial<MonthOverviewData>)}
          />
          <span className="month-overview-unit">кг</span>
        </div>
        {delta !== null && (
          <span className={`month-overview-delta month-overview-delta--${delta.tone}`}>
            {delta.text}
          </span>
        )}
      </div>
    );
  };

  return (
    <div className="month-overview">
      <header className="month-overview-head">
        <h2 className="month-overview-title">Вес по месяцу</h2>
        <p className="month-overview-sub">Старт, цель и итог каждой недели — дельта от первого веса</p>
      </header>

      <div className="month-overview-panel">
        <section className="month-overview-section" aria-label="Стартовые веса">
          <div className="month-overview-row month-overview-row--goal">
            <span className="month-overview-label">Первоначальный вес</span>
            <div className="month-overview-value-wrap">
              <input
                type="text"
                inputMode="decimal"
                className="month-overview-input"
                aria-label="Первоначальный вес, кг"
                value={data.initialWeightKg}
                onChange={(e) => patch({ initialWeightKg: e.target.value })}
              />
              <span className="month-overview-unit">кг</span>
            </div>
          </div>

          <div className="month-overview-row month-overview-row--goal">
            <span className="month-overview-label">Желаемый вес</span>
            <div className="month-overview-value-wrap">
              <input
                type="text"
                inputMode="decimal"
                className="month-overview-input"
                aria-label="Желаемый вес, кг"
                value={data.targetWeightKg}
                onChange={(e) => patch({ targetWeightKg: e.target.value })}
              />
              <span className="month-overview-unit">кг</span>
            </div>
          </div>
        </section>

        <div className="month-overview-divider" role="presentation" />

        <section className="month-overview-section" aria-label="Итоги по неделям">
          <h3 className="month-overview-section-label">Недели</h3>
          {weekRow(1, 'week1WeightKg')}
          {weekRow(2, 'week2WeightKg')}
          {weekRow(3, 'week3WeightKg')}
          {weekRow(4, 'week4WeightKg')}
        </section>
      </div>
    </div>
  );
};

export default MonthOverview;
