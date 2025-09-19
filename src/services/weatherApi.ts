// Weather API Service
const WEATHER_API_KEY = 'your_openweathermap_api_key'; // Get from https://openweathermap.org/api
const WEATHER_BASE_URL = 'https://api.openweathermap.org/data/2.5';

export interface WeatherData {
  temperature: number;
  description: string;
  humidity: number;
  windSpeed: number;
  icon: string;
  city: string;
}

export class WeatherService {
  static async getWeatherByCity(city: string): Promise<WeatherData> {
    try {
      const response = await fetch(
        `${WEATHER_BASE_URL}/weather?q=${city}&appid=${WEATHER_API_KEY}&units=metric`
      );
      
      if (!response.ok) {
        throw new Error('Weather data not found');
      }
      
      const data = await response.json();
      
      return {
        temperature: Math.round(data.main.temp),
        description: data.weather[0].description,
        humidity: data.main.humidity,
        windSpeed: data.wind.speed,
        icon: data.weather[0].icon,
        city: data.name
      };
    } catch (error) {
      console.error('Weather API Error:', error);
      throw error;
    }
  }

  static async getWeatherByCoordinates(lat: number, lon: number): Promise<WeatherData> {
    try {
      const response = await fetch(
        `${WEATHER_BASE_URL}/weather?lat=${lat}&lon=${lon}&appid=${WEATHER_API_KEY}&units=metric`
      );
      
      if (!response.ok) {
        throw new Error('Weather data not found');
      }
      
      const data = await response.json();
      
      return {
        temperature: Math.round(data.main.temp),
        description: data.weather[0].description,
        humidity: data.main.humidity,
        windSpeed: data.wind.speed,
        icon: data.weather[0].icon,
        city: data.name
      };
    } catch (error) {
      console.error('Weather API Error:', error);
      throw error;
    }
  }
}
