import React, { useState, useEffect } from 'react';
import { Cloud, Sun, CloudRain, Wind, Droplets, Thermometer } from 'lucide-react';
import { WeatherService, WeatherData } from '../../services/weatherApi';

interface WeatherWidgetProps {
  city: string;
  className?: string;
}

const WeatherWidget: React.FC<WeatherWidgetProps> = ({ city, className = '' }) => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        setLoading(true);
        const weatherData = await WeatherService.getWeatherByCity(city);
        setWeather(weatherData);
        setError(null);
      } catch (err) {
        setError('Weather data unavailable');
        console.error('Weather fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    if (city) {
      fetchWeather();
    }
  }, [city]);

  const getWeatherIcon = (icon: string) => {
    if (icon.includes('01') || icon.includes('02')) return <Sun className="w-6 h-6 text-yellow-500" />;
    if (icon.includes('03') || icon.includes('04')) return <Cloud className="w-6 h-6 text-gray-500" />;
    if (icon.includes('09') || icon.includes('10')) return <CloudRain className="w-6 h-6 text-blue-500" />;
    return <Cloud className="w-6 h-6 text-gray-500" />;
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow-md p-4 ${className}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-8 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (error || !weather) {
    return (
      <div className={`bg-white rounded-lg shadow-md p-4 ${className}`}>
        <div className="text-center text-gray-500">
          <Cloud className="w-8 h-8 mx-auto mb-2" />
          <p className="text-sm">Weather unavailable</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-lg shadow-md p-4 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="font-semibold text-lg">{weather.city}</h3>
          <p className="text-sm opacity-90 capitalize">{weather.description}</p>
        </div>
        <div className="text-right">
          {getWeatherIcon(weather.icon)}
        </div>
      </div>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Thermometer className="w-5 h-5 mr-1" />
          <span className="text-2xl font-bold">{weather.temperature}°C</span>
        </div>
        
        <div className="flex space-x-4 text-sm">
          <div className="flex items-center">
            <Droplets className="w-4 h-4 mr-1" />
            <span>{weather.humidity}%</span>
          </div>
          <div className="flex items-center">
            <Wind className="w-4 h-4 mr-1" />
            <span>{weather.windSpeed} m/s</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeatherWidget;
