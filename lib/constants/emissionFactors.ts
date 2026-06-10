export const EMISSION_FACTORS = {
  transportation: {
    car_petrol_km: 0.192,
    car_electric_km: 0.053,
    flight_domestic_km: 0.255,
    flight_international_km: 0.195,
    bus_km: 0.089,
    train_km: 0.041,
    motorcycle_km: 0.103,
    bicycle_km: 0,
    walking_km: 0,
  },
  food: {
    beef_kg: 27.0,
    chicken_kg: 6.9,
    pork_kg: 12.1,
    fish_kg: 5.1,
    eggs_kg: 4.5,
    dairy_liter: 3.2,
    cheese_kg: 13.5,
    vegetables_kg: 2.0,
    fruits_kg: 1.1,
    grains_kg: 1.4,
    legumes_kg: 0.9,
    nuts_kg: 0.3,
    tofu_kg: 2.0,
    coffee_cup: 0.3,
  },
  energy: {
    electricity_kwh: 0.475,
    natural_gas_kwh: 0.185,
    heating_oil_liter: 2.68,
    solar_kwh: 0.02,
    wind_kwh: 0.01,
  },
  shopping: {
    clothing_item: 15.0,
    electronics_item: 50.0,
    furniture_item: 30.0,
    book_item: 2.5,
    toy_item: 5.0,
    other_item: 10.0,
  },
  waste: {
    landfill_kg: 0.6,
    recycled_kg: 0.05,
    composted_kg: 0.02,
  },
} as const;

export type TransportationType = keyof typeof EMISSION_FACTORS.transportation;
export type FoodType = keyof typeof EMISSION_FACTORS.food;
export type EnergyType = keyof typeof EMISSION_FACTORS.energy;
export type ShoppingType = keyof typeof EMISSION_FACTORS.shopping;
export type WasteType = keyof typeof EMISSION_FACTORS.waste;

export type EmissionSubcategory =
  | TransportationType
  | FoodType
  | EnergyType
  | ShoppingType
  | WasteType;

export const SUBCATEGORY_LABELS: Record<string, string> = {
  car_petrol_km: 'Car (Petrol)',
  car_electric_km: 'Car (Electric)',
  flight_domestic_km: 'Flight (Domestic)',
  flight_international_km: 'Flight (International)',
  bus_km: 'Bus',
  train_km: 'Train',
  motorcycle_km: 'Motorcycle',
  bicycle_km: 'Bicycle',
  walking_km: 'Walking',
  beef_kg: 'Beef',
  chicken_kg: 'Chicken',
  pork_kg: 'Pork',
  fish_kg: 'Fish',
  eggs_kg: 'Eggs',
  dairy_liter: 'Dairy',
  cheese_kg: 'Cheese',
  vegetables_kg: 'Vegetables',
  fruits_kg: 'Fruits',
  grains_kg: 'Grains',
  legumes_kg: 'Legumes',
  nuts_kg: 'Nuts',
  tofu_kg: 'Tofu',
  coffee_cup: 'Coffee',
  electricity_kwh: 'Electricity',
  natural_gas_kwh: 'Natural Gas',
  heating_oil_liter: 'Heating Oil',
  solar_kwh: 'Solar',
  wind_kwh: 'Wind',
  clothing_item: 'Clothing',
  electronics_item: 'Electronics',
  furniture_item: 'Furniture',
  book_item: 'Books',
  toy_item: 'Toys',
  other_item: 'Other Items',
  landfill_kg: 'Landfill Waste',
  recycled_kg: 'Recycled Waste',
  composted_kg: 'Composted Waste',
};

export const CATEGORY_ICONS: Record<string, string> = {
  transportation: '🚗',
  food: '🥗',
  energy: '⚡',
  shopping: '🛍️',
  waste: '♻️',
};

export const CATEGORY_COLORS: Record<string, string> = {
  transportation: '#3b82f6',
  food: '#f59e0b',
  energy: '#10b981',
  shopping: '#a78bfa',
  waste: '#ef4444',
};

export const CATEGORY_LABELS: Record<string, string> = {
  transportation: 'Transportation',
  food: 'Food & Diet',
  energy: 'Energy Usage',
  shopping: 'Shopping',
  waste: 'Waste',
};
