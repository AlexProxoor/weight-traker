import { Check } from 'lucide-react';
import type { MouseEvent } from 'react';

interface CalendarGridProps {
    year: number;
    month: number;
    markedDays: Set<string>;
    selectedDate: string | null;
    onDayClick: (dateKey: string) => void;
    onDayDoubleClick: (dateKey: string) => void;
    /** Без строки «Май» сверху — для встроенного мини-календаря */
    hideMonthTitle?: boolean;
    /** Трекер привычки: один клик, зелёная отметка с галочкой и «готово» */
    habitTracker?: boolean;
}

const CalendarGrid = ({
    year,
    month,
    markedDays,
    selectedDate,
    onDayClick,
    onDayDoubleClick,
    hideMonthTitle = false,
    habitTracker = false,
}: CalendarGridProps) => {
    const getDaysInMonth = (y: number, m: number) => new Date(y, m + 1, 0).getDate();
    const getFirstDayOfMonth = (y: number, m: number) => new Date(y, m, 1).getDay();

    const daysInMonth = getDaysInMonth(year, month);
    let firstDayIndex = getFirstDayOfMonth(year, month);
    firstDayIndex = firstDayIndex === 0 ? 6 : firstDayIndex - 1;

    const daysArray = [];
    for (let i = 0; i < firstDayIndex; i++) {
        daysArray.push(null);
    }
    for (let d = 1; d <= daysInMonth; d++) {
        daysArray.push(d);
    }

    const handleClick = (day: number) => {
        const dateKey = `${year}-${month}-${day}`;
        onDayClick(dateKey);
    };

    const handleDoubleClick = (day: number) => {
        const dateKey = `${year}-${month}-${day}`;
        onDayDoubleClick(dateKey);
    };

    const handleCellClick = (day: number, e: MouseEvent<HTMLDivElement>) => {
        if (habitTracker && e.detail !== 1) return;
        handleClick(day);
    };

    const isSelected = (day: number) => {
        return selectedDate === `${year}-${month}-${day}`;
    };

    const monthNames = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];

    return (
        <div
            className={`calendar-grid${hideMonthTitle ? ' calendar-grid--compact' : ''}${
                habitTracker ? ' calendar-grid--habit' : ''
            }`}
        >
            {!hideMonthTitle && <div className="month-title">{monthNames[month]}</div>}
            <div className="weekdays">
                {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map((day) => (
                    <div key={day} className="weekday">
                        {day}
                    </div>
                ))}
            </div>
            <div className="days">
                {daysArray.map((day, idx) => {
                    const dateKey =
                        day !== null ? `${year}-${month}-${day}` : '';
                    const isMarked = day !== null && markedDays.has(dateKey);
                    const markClass = isMarked
                        ? habitTracker
                            ? 'habit-done'
                            : 'marked'
                        : '';
                    return (
                        <div
                            key={idx}
                            className={`day-cell ${markClass}
              ${day !== null && isSelected(day) ? 'selected' : ''}
            `}
                            onClick={(e) => day !== null && handleCellClick(day, e)}
                            onDoubleClick={() =>
                                day !== null && !habitTracker && handleDoubleClick(day)
                            }
                        >
                            {day !== null ? (
                                habitTracker && isMarked ? (
                                    <span className="day-cell-habit-inner">
                                        <Check
                                            className="day-cell-habit-check"
                                            size={14}
                                            strokeWidth={2.5}
                                            aria-hidden
                                        />
                                        <span className="day-cell-habit-done-text">
                                            готово
                                        </span>
                                    </span>
                                ) : (
                                    day
                                )
                            ) : (
                                ''
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default CalendarGrid;