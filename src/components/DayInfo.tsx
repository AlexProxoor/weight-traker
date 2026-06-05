import { useState, useEffect, useRef } from 'react';
import {
    Heart, CheckCircle, XCircle, Plus, Trash2,
    Utensils, Dumbbell, ChevronDown, ChevronRight,
    PlusCircle, Save
} from 'lucide-react';
import type { DayData, FoodItem, SportItem, Exercise } from '../types';

interface DayInfoProps {
    dateKey: string;
    initialData?: DayData;
    onSave: (dateKey: string, data: DayData) => void;
}

type TabType = 'food' | 'sport';

const DayInfo = ({ dateKey, initialData, onSave }: DayInfoProps) => {
    const [activeTab, setActiveTab] = useState<TabType>('food');
    const [deficitAchieved, setDeficitAchieved] = useState<boolean>(
        initialData?.deficitAchieved ?? false
    );
    const [foodList, setFoodList] = useState<FoodItem[]>(initialData?.foodList ?? []);
    const [sportList, setSportList] = useState<SportItem[]>(() => {
        // Защита от старых данных: добавляем exercises и isExpanded если их нет
        const list = initialData?.sportList ?? [];
        return list.map(sport => ({
            ...sport,
            exercises: sport.exercises || [],
            isExpanded: sport.isExpanded || false,
        }));
    });

    const [newFoodName, setNewFoodName] = useState('');
    const [newFoodCalories, setNewFoodCalories] = useState('');
    const [newSportName, setNewSportName] = useState('');
    const [newSportCalories, setNewSportCalories] = useState('');

    const [editingSportId, setEditingSportId] = useState<string | null>(null);
    const [newExerciseName, setNewExerciseName] = useState('');
    const [newExerciseSets, setNewExerciseSets] = useState('');
    const [newExerciseReps, setNewExerciseReps] = useState('');
    const [newExerciseDuration, setNewExerciseDuration] = useState('');

    const isFirstRender = useRef(true);
    const prevDateKey = useRef(dateKey);

    const totalCalories = foodList.reduce((sum, item) => sum + item.calories, 0);
    const totalBurned = sportList.reduce((sum, item) => sum + (item.caloriesBurned || 0), 0);

    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }

        onSave(dateKey, {
            deficitAchieved,
            foodList,
            sportList,
            totalCalories,
            totalBurned,
        });
    }, [deficitAchieved, foodList, sportList, totalCalories, totalBurned, dateKey, onSave]);

    useEffect(() => {
        if (prevDateKey.current !== dateKey) {
            prevDateKey.current = dateKey;
            isFirstRender.current = true;

            setDeficitAchieved(initialData?.deficitAchieved ?? false);
            setFoodList(initialData?.foodList ?? []);
            // Защита при смене дня
            const newSportList = (initialData?.sportList ?? []).map(sport => ({
                ...sport,
                exercises: sport.exercises || [],
                isExpanded: sport.isExpanded || false,
            }));
            setSportList(newSportList);
            setNewFoodName('');
            setNewFoodCalories('');
            setNewSportName('');
            setNewSportCalories('');
            setEditingSportId(null);

            setTimeout(() => {
                isFirstRender.current = false;
            }, 0);
        }
    }, [dateKey, initialData]);

    const addFoodItem = () => {
        if (newFoodName.trim() && newFoodCalories) {
            const calories = parseInt(newFoodCalories);
            if (!isNaN(calories) && calories > 0) {
                const newItem: FoodItem = {
                    id: `${Date.now()}-${Math.random()}`,
                    name: newFoodName.trim(),
                    calories: calories,
                };
                setFoodList(prev => [...prev, newItem]);
                setNewFoodName('');
                setNewFoodCalories('');
            }
        }
    };

    const deleteFoodItem = (id: string) => {
        setFoodList(prev => prev.filter(item => item.id !== id));
    };

    const addSportItem = () => {
        if (newSportName.trim() && newSportCalories) {
            const caloriesBurned = parseInt(newSportCalories);
            if (!isNaN(caloriesBurned) && caloriesBurned > 0) {
                const newItem: SportItem = {
                    id: `${Date.now()}-${Math.random()}`,
                    name: newSportName.trim(),
                    caloriesBurned: caloriesBurned,
                    exercises: [],
                    isExpanded: false,
                };
                setSportList(prev => [...prev, newItem]);
                setNewSportName('');
                setNewSportCalories('');
            }
        }
    };

    const deleteSportItem = (id: string) => {
        setSportList(prev => prev.filter(item => item.id !== id));
    };

    const toggleSportExpand = (id: string) => {
        setSportList(prev => prev.map(item =>
            item.id === id ? { ...item, isExpanded: !item.isExpanded } : item
        ));
    };

    const addExercise = (sportId: string) => {
        if (!newExerciseName.trim()) return;

        const exercise: Exercise = {
            id: `${Date.now()}-${Math.random()}`,
            name: newExerciseName.trim(),
            sets: newExerciseSets ? parseInt(newExerciseSets) : undefined,
            reps: newExerciseReps ? parseInt(newExerciseReps) : undefined,
            duration: newExerciseDuration ? parseInt(newExerciseDuration) : undefined,
        };

        setSportList(prev => prev.map(item =>
            item.id === sportId
                ? { ...item, exercises: [...(item.exercises || []), exercise] }
                : item
        ));

        setNewExerciseName('');
        setNewExerciseSets('');
        setNewExerciseReps('');
        setNewExerciseDuration('');
        setEditingSportId(null);
    };

    const deleteExercise = (sportId: string, exerciseId: string) => {
        setSportList(prev => prev.map(item =>
            item.id === sportId
                ? { ...item, exercises: (item.exercises || []).filter(ex => ex.id !== exerciseId) }
                : item
        ));
    };

    const toggleDeficit = () => {
        setDeficitAchieved(prev => !prev);
    };

    const [year, month, day] = dateKey.split('-');

    const getMonthName = (monthIndex: number) => {
        const months = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
        return months[monthIndex];
    };

    const displayDate = `${parseInt(day)} ${getMonthName(parseInt(month))}`;

    const getDayOfWeek = () => {
        const date = new Date(parseInt(year), parseInt(month), parseInt(day));
        const days = ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'];
        return days[date.getDay()];
    };

    return (
        <div className="day-info">
            <div className="day-header">
                <Heart size={22} color="#a26fc7" fill="#d9b4f0" />
                <div>
                    <h3>{displayDate}</h3>
                    <p className="day-week">{getDayOfWeek()}</p>
                </div>
            </div>

            <div className="deficit-header">
                <h4>Дефицит калорий 💜</h4>
                <button className="check-btn" onClick={toggleDeficit}>
                    {deficitAchieved ? (
                        <CheckCircle size={24} color="#a26fc7" fill="#a26fc7" />
                    ) : (
                        <XCircle size={24} color="#c2abc9" />
                    )}
                </button>
            </div>

            <div className="tabs">
                <button
                    className={`tab-btn ${activeTab === 'food' ? 'active' : ''}`}
                    onClick={() => setActiveTab('food')}
                >
                    <Utensils size={16} /> 🍽 Еда
                </button>
                <button
                    className={`tab-btn ${activeTab === 'sport' ? 'active' : ''}`}
                    onClick={() => setActiveTab('sport')}
                >
                    <Dumbbell size={16} /> 🏃 Спорт
                </button>
            </div>

            {activeTab === 'food' && (
                <div className="column" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <div className="food-list" style={{ flex: 1 }}>
                        {foodList.length === 0 ? (
                            <div className="empty-actions">Добавьте продукты и блюда 💜</div>
                        ) : (
                            foodList.map((item) => (
                                <div key={item.id} className="food-item">
                                    <span className="item-name">🍽 {item.name}</span>
                                    <span className="item-calories">{item.calories} ккал</span>
                                    <button onClick={() => deleteFoodItem(item.id)} className="delete-item-btn">
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            ))
                        )}
                    </div>

                    <div className="add-item">
                        <input
                            type="text"
                            placeholder="Что съели?"
                            value={newFoodName}
                            onChange={(e) => setNewFoodName(e.target.value)}
                            className="item-name-input"
                        />
                        <input
                            type="number"
                            placeholder="ккал"
                            value={newFoodCalories}
                            onChange={(e) => setNewFoodCalories(e.target.value)}
                            className="item-calories-input"
                        />
                        <button onClick={addFoodItem} className="add-item-btn">
                            <Plus size={16} />
                        </button>
                    </div>

                    <div className="total-info">
                        <Heart size={16} color="#a26fc7" fill="#d9b4f0" />
                        <span>Съедено: </span>
                        <strong>{totalCalories} ккал</strong>
                    </div>
                </div>
            )}

            {activeTab === 'sport' && (
                <div className="column" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <div className="sport-list" style={{ flex: 1 }}>
                        {sportList.length === 0 ? (
                            <div className="empty-actions">Добавьте тренировки 💜</div>
                        ) : (
                            sportList.map((sport) => (
                                <div key={sport.id} className="sport-item-wrapper">
                                    <div className="sport-item-header">
                                        <button
                                            className="expand-btn"
                                            onClick={() => toggleSportExpand(sport.id)}
                                        >
                                            {sport.isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                                        </button>
                                        <span className="sport-name">🏃‍♀️ {sport.name}</span>
                                        <span className="sport-calories">-{sport.caloriesBurned} ккал</span>
                                        <button onClick={() => deleteSportItem(sport.id)} className="delete-item-btn">
                                            <Trash2 size={14} />
                                        </button>
                                    </div>

                                    {sport.isExpanded && (
                                        <div className="exercises-list">
                                            {(sport.exercises || []).length > 0 && (
                                                <div className="exercises">
                                                    {(sport.exercises || []).map((ex) => (
                                                        <div key={ex.id} className="exercise-item">
                                                            <span className="exercise-name">• {ex.name}</span>
                                                            <span className="exercise-details">
                                                                {ex.sets && `${ex.sets} × ${ex.reps || ''}`}
                                                                {ex.duration && `${ex.duration} мин`}
                                                            </span>
                                                            <button
                                                                onClick={() => deleteExercise(sport.id, ex.id)}
                                                                className="delete-exercise-btn"
                                                            >
                                                                <Trash2 size={12} />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            {editingSportId === sport.id ? (
                                                <div className="add-exercise-form">
                                                    <input
                                                        type="text"
                                                        placeholder="Упражнение (например: жим лёжа)"
                                                        value={newExerciseName}
                                                        onChange={(e) => setNewExerciseName(e.target.value)}
                                                        className="exercise-name-input"
                                                    />
                                                    <div className="exercise-numbers">
                                                        <input
                                                            type="number"
                                                            placeholder="подходы"
                                                            value={newExerciseSets}
                                                            onChange={(e) => setNewExerciseSets(e.target.value)}
                                                            className="exercise-small-input"
                                                        />
                                                        <input
                                                            type="number"
                                                            placeholder="повторы"
                                                            value={newExerciseReps}
                                                            onChange={(e) => setNewExerciseReps(e.target.value)}
                                                            className="exercise-small-input"
                                                        />
                                                        <input
                                                            type="number"
                                                            placeholder="мин"
                                                            value={newExerciseDuration}
                                                            onChange={(e) => setNewExerciseDuration(e.target.value)}
                                                            className="exercise-small-input"
                                                        />
                                                    </div>
                                                    <div className="add-exercise-buttons">
                                                        <button onClick={() => addExercise(sport.id)} className="save-exercise-btn">
                                                            <Save size={14} /> Сохранить
                                                        </button>
                                                        <button
                                                            onClick={() => setEditingSportId(null)}
                                                            className="cancel-exercise-btn"
                                                        >
                                                            Отмена
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <button
                                                    className="add-exercise-btn"
                                                    onClick={() => setEditingSportId(sport.id)}
                                                >
                                                    <PlusCircle size={14} /> Добавить упражнение
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>

                    <div className="add-sport-form">
                        <input
                            type="text"
                            placeholder="Новая тренировка (тренажёрка, ролики...)"
                            value={newSportName}
                            onChange={(e) => setNewSportName(e.target.value)}
                            className="sport-name-input"
                        />
                        <input
                            type="number"
                            placeholder="ккал"
                            value={newSportCalories}
                            onChange={(e) => setNewSportCalories(e.target.value)}
                            className="sport-calories-input"
                        />
                        <button onClick={addSportItem} className="add-sport-btn">
                            <Plus size={16} /> Добавить
                        </button>
                    </div>

                    <div className="total-info">
                        <Dumbbell size={16} color="#a26fc7" />
                        <span>Сожжено: </span>
                        <strong>{totalBurned} ккал</strong>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DayInfo;