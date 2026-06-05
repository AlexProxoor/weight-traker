export interface FoodItem {
  id: string;
  name: string;
  calories: number;
}

export interface Exercise {
  id: string;
  name: string;
  sets?: number;
  reps?: number;
  duration?: number;
}

export interface SportItem {
  id: string;
  name: string;
  caloriesBurned: number;
  exercises: Exercise[];
  isExpanded: boolean;
}

export interface DayData {
  deficitAchieved: boolean;
  foodList: FoodItem[];
  sportList: SportItem[];
  totalCalories: number;
  totalBurned: number;
}

/** Стартовая страница месяца: старт, цель, вес на конец каждой из 4 недель */
export interface MonthOverviewData {
  initialWeightKg: string;
  targetWeightKg: string;
  week1WeightKg: string;
  week2WeightKg: string;
  week3WeightKg: string;
  week4WeightKg: string;
}
