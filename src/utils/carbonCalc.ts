import { QuizAnswers, LoggedActivity, ActivityCategory } from '../types';

// Standard scientific CO2 emission factors (in kg CO2 equivalents)
export const EMISSION_FACTORS = {
  transport: {
    car_ice: 0.18,      // per km (standard medium gasoline car)
    car_ev: 0.05,       // per km (electric vehicle based on average grid mix)
    transit: 0.04,      // per km (bus/train mix)
    bike_walk: 0.0,     // per km
  },
  diet: {
    meat_heavy: 7.2,    // per average day/meals
    meat_light: 4.1,    // per average day/meals
    vegetarian: 2.4,    // per average day/meals
    vegan: 1.5,         // per average day/meals
  },
  energy: {
    coal_gas: 0.85,     // per kWh of home electricity/heating
    mix: 0.42,          // per kWh of average grid mix
    renewable: 0.02,    // per kWh (solar/wind/hydro footprint)
  },
  purchases: {
    high: 15.0,         // kg CO2 per day of high consumer habits
    moderate: 7.5,      // kg CO2 per day of moderate habits
    low: 2.5,           // kg CO2 per day of minimalist habits
  },
};

// Calculate estimated annual carbon footprint in Tonnes (1 Tonne = 1000 kg)
export function calculateAnnualBaseline(answers: QuizAnswers): number {
  // 1. Transport contribution
  const dailyKm = answers.commuteDistance;
  const transportFactor = EMISSION_FACTORS.transport[answers.transportMode as keyof typeof EMISSION_FACTORS.transport] ?? 0.18;
  const transportDaily = dailyKm * transportFactor;

  // 2. Diet contribution
  const dietDaily = EMISSION_FACTORS.diet[answers.dietType as keyof typeof EMISSION_FACTORS.diet] ?? 4.1;

  // 3. Home Energy contribution
  // Estimate daily electricity usage based on energy choice (assume grid average ~12 kWh/day for a household scaled per capita)
  const dailyKwh = 10;
  const energyFactor = EMISSION_FACTORS.energy[answers.homeEnergy as keyof typeof EMISSION_FACTORS.energy] ?? 0.42;
  const energyDaily = dailyKwh * energyFactor;

  // 4. Purchases contribution
  const purchaseDaily = EMISSION_FACTORS.purchases[answers.purchaseHabit as keyof typeof EMISSION_FACTORS.purchases] ?? 7.5;

  const totalDailyKg = transportDaily + dietDaily + energyDaily + purchaseDaily;
  
  // Return annual footprint in tonnes of CO2
  return (totalDailyKg * 365) / 1000;
}

// Generate typical daily activities based on quiz baseline
// This populates a realistic 30-day baseline so that charts are immediately interactive and realistic!
export function generate30DayHistory(answers: QuizAnswers): LoggedActivity[] {
  const activities: LoggedActivity[] = [];
  const now = new Date();

  // Factors
  const transportFactor = EMISSION_FACTORS.transport[answers.transportMode as keyof typeof EMISSION_FACTORS.transport] ?? 0.18;
  const dietValue = EMISSION_FACTORS.diet[answers.dietType as keyof typeof EMISSION_FACTORS.diet] ?? 4.1;
  const energyFactor = EMISSION_FACTORS.energy[answers.homeEnergy as keyof typeof EMISSION_FACTORS.energy] ?? 0.42;
  const purchaseValue = EMISSION_FACTORS.purchases[answers.purchaseHabit as keyof typeof EMISSION_FACTORS.purchases] ?? 7.5;

  for (let i = 29; i >= 0; i--) {
    const date = new Date();
    date.setDate(now.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];

    // Add Transport log (if commute distance > 0)
    // Add small random variations to make details feel real and engaging!
    const transportVar = 0.8 + Math.random() * 0.4; // 80% to 120%
    const finalTransportDistance = Math.max(0, parseFloat((answers.commuteDistance * transportVar).toFixed(1)));
    if (finalTransportDistance > 0) {
      activities.push({
        id: `gen-trans-${dateStr}`,
        date: dateStr,
        category: 'transport',
        description: `Commute via ${getTransportLabel(answers.transportMode)}`,
        amount: finalTransportDistance,
        co2Impact: parseFloat((finalTransportDistance * transportFactor).toFixed(2)),
      });
    }

    // Add Food log
    const dietVar = 0.9 + Math.random() * 0.2;
    activities.push({
      id: `gen-food-${dateStr}`,
      date: dateStr,
      category: 'food',
      description: `Daily meals (${getDietLabel(answers.dietType)})`,
      amount: 1,
      co2Impact: parseFloat((dietValue * dietVar).toFixed(2)),
    });

    // Add Energy log (assume daily reading of about 10 kWh)
    const energyVar = 0.85 + Math.random() * 0.3;
    const dailyKwh = parseFloat((10 * energyVar).toFixed(1));
    activities.push({
      id: `gen-energy-${dateStr}`,
      date: dateStr,
      category: 'energy',
      description: `Household electricity & heating`,
      amount: dailyKwh,
      co2Impact: parseFloat((dailyKwh * energyFactor).toFixed(2)),
    });

    // Add Purchase log
    const purchaseVar = 0.7 + Math.random() * 0.6;
    activities.push({
      id: `gen-purch-${dateStr}`,
      date: dateStr,
      category: 'purchases',
      description: `Daily consumption footprint`,
      amount: 1,
      co2Impact: parseFloat((purchaseValue * purchaseVar).toFixed(2)),
    });
  }

  return activities;
}

export function getTransportLabel(mode: string): string {
  switch (mode) {
    case 'car_ice': return 'Gas/Diesel Car';
    case 'car_ev': return 'Electric Vehicle';
    case 'transit': return 'Public Transit';
    case 'bike_walk': return 'Biking / Walking';
    default: return 'Transport';
  }
}

export function getDietLabel(diet: string): string {
  switch (diet) {
    case 'meat_heavy': return 'Heavy Meat Eater';
    case 'meat_light': return 'Low Meat / Omnivore';
    case 'vegetarian': return 'Vegetarian';
    case 'vegan': return 'Vegan';
    default: return 'Diet';
  }
}

export function getEnergyLabel(energy: string): string {
  switch (energy) {
    case 'coal_gas': return 'Fossil Fuel Heavily Centered';
    case 'mix': return 'Standard Grid Mix';
    case 'renewable': return '100% Renewable source';
    default: return 'Grid Mix';
  }
}

export function getPurchaseLabel(habit: string): string {
  switch (habit) {
    case 'high': return 'High Consumer Purchases';
    case 'moderate': return 'Moderate / Thoughtful Consumer';
    case 'low': return 'Minimalist/Low-Impact style';
    default: return 'Consumer';
  }
}
