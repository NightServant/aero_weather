export type TempUnit = "celsius" | "fahrenheit";
export type WindUnit = "kmh" | "mph" | "ms";
export type PrecipUnit = "mm" | "inch";

export type UnitPrefs = {
  temperature: TempUnit;
  wind: WindUnit;
  precipitation: PrecipUnit;
};

export type Place = {
  id: number;
  name: string;
  admin1?: string;
  country: string;
  countryCode: string;
  latitude: number;
  longitude: number;
  timezone: string;
  population?: number;
};

export type CurrentConditions = {
  time: string;
  temperature: number;
  apparentTemperature: number;
  humidity: number;
  precipitation: number;
  windSpeed: number;
  windDirection: number;
  weatherCode: number;
  isDay: boolean;
  pressure: number;
  cloudCover: number;
  visibility: number;
  uvIndex: number;
};

export type HourlyPoint = {
  time: string;
  temperature: number;
  precipitationProbability: number;
  weatherCode: number;
  isDay: boolean;
};

export type DailyPoint = {
  date: string;
  weatherCode: number;
  tempMax: number;
  tempMin: number;
  precipitationSum: number;
  precipitationProbabilityMax: number;
  windSpeedMax: number;
  sunrise: string;
  sunset: string;
  uvIndexMax: number;
};

export type Forecast = {
  place: Pick<Place, "latitude" | "longitude" | "timezone">;
  current: CurrentConditions;
  hourly: HourlyPoint[];
  daily: DailyPoint[];
};

export type AirQuality = {
  time: string;
  usAqi: number;
  pm2_5: number;
  pm10: number;
  ozone: number;
  no2: number;
};
