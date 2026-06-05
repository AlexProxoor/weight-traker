import { useState } from 'react';
import { Heart } from 'lucide-react';

const DailyTracker = () => {
    const [deficit, setDeficit] = useState<number>(500);
    const [actions, setActions] = useState<string[]>([]);
    const [newAction, setNewAction] = useState('');

    const addAction = () => {
        if (newAction.trim()) {
            setActions([...actions, newAction]);
            setNewAction('');
        }
    };

    const deleteAction = (index: number) => {
        setActions(actions.filter((_, i) => i !== index));
    };

    return (
        <div className="daily-tracker">
            <div className="column">
                <h3>
                    <Heart size={20} color="#a26fc7" fill="#d9b4f0" /> Мой дефицит калорий
                </h3>
                <div className="deficit-control">
                    <button onClick={() => setDeficit(Math.max(100, deficit - 50))}>-50</button>
                    <span className="deficit-value">{deficit} ккал</span>
                    <button onClick={() => setDeficit(deficit + 50)}>+50</button>
                </div>
                <div className="deficit-tip">Рекомендуемый дефицит: 300–500 ккал/день</div>
            </div>

            <div className="column">
                <h3>
                    <Heart size={20} color="#a26fc7" fill="#d9b4f0" /> Что я сделала сегодня
                </h3>
                <div className="action-list">
                    {actions.map((action, idx) => (
                        <div key={idx} className="action-item">
                            <span>{action}</span>
                            <button onClick={() => deleteAction(idx)}>✕</button>
                        </div>
                    ))}
                </div>
                <div className="action-input">
                    <input
                        type="text"
                        placeholder="➕ Прогулка, вода, зарядка..."
                        value={newAction}
                        onChange={(e) => setNewAction(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && addAction()}
                    />
                    <button onClick={addAction}>Добавить</button>
                </div>
            </div>
        </div>
    );
};

export default DailyTracker;