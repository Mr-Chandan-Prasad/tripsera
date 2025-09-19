import React, { useState } from 'react';
import { useLocalStorageQuery, initializeSampleData } from '../hooks/useLocalStorage';
import { formatPrice, getPriceForCalculation } from '../utils/priceUtils';

const DebugBooking: React.FC = () => {
  const [testResults, setTestResults] = useState<string[]>([]);
  
  const { data: destinations } = useLocalStorageQuery('destinations', '*');
  const { data: services } = useLocalStorageQuery('services', '*');
  const { data: addons } = useLocalStorageQuery('addons', '*');

  const addLog = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const runTests = () => {
    setTestResults([]);
    addLog('Starting booking system tests...');
    
    // Test 1: Check if data is loaded
    addLog(`Destinations loaded: ${destinations?.length || 0}`);
    addLog(`Services loaded: ${services?.length || 0}`);
    addLog(`Add-ons loaded: ${addons?.length || 0}`);
    
    // Test 2: Check price calculations
    if (destinations && destinations.length > 0) {
      const dest = destinations[0];
      addLog(`Destination: ${dest.name}`);
      addLog(`Base price: ${dest.price}`);
      addLog(`Price range: ${dest.price_range ? `${dest.price_range.min}-${dest.price_range.max}` : 'None'}`);
      addLog(`Formatted price: ${formatPrice(dest)}`);
      addLog(`Price for calculation: ${getPriceForCalculation(dest)}`);
    }
    
    if (services && services.length > 0) {
      const service = services[0];
      addLog(`Service: ${service.name}`);
      addLog(`Base price: ${service.price}`);
      addLog(`Price range: ${service.price_range ? `${service.price_range.min}-${service.price_range.max}` : 'None'}`);
      addLog(`Formatted price: ${formatPrice(service)}`);
      addLog(`Price for calculation: ${getPriceForCalculation(service)}`);
    }
    
    // Test 3: Check localStorage
    try {
      const bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
      addLog(`Existing bookings: ${bookings.length}`);
    } catch (error) {
      addLog(`Error reading bookings: ${error}`);
    }
    
    addLog('Tests completed!');
  };

  const clearData = () => {
    localStorage.removeItem('destinations');
    localStorage.removeItem('services');
    localStorage.removeItem('addons');
    localStorage.removeItem('bookings');
    addLog('All data cleared!');
  };

  const initializeData = () => {
    initializeSampleData();
    addLog('Sample data initialized!');
  };

  return (
    <div className="p-4 bg-gray-100 rounded-lg m-4">
      <h3 className="text-lg font-bold mb-4">🔧 Booking System Debug</h3>
      
      <div className="space-y-2 mb-4">
        <button
          onClick={runTests}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Run Tests
        </button>
        <button
          onClick={initializeData}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 ml-2"
        >
          Initialize Data
        </button>
        <button
          onClick={clearData}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 ml-2"
        >
          Clear Data
        </button>
      </div>
      
      <div className="bg-white p-4 rounded border max-h-96 overflow-y-auto">
        <h4 className="font-semibold mb-2">Test Results:</h4>
        {testResults.length === 0 ? (
          <p className="text-gray-500">Click "Run Tests" to see results</p>
        ) : (
          <div className="space-y-1">
            {testResults.map((result, index) => (
              <div key={index} className="text-sm font-mono text-gray-700">
                {result}
              </div>
            ))}
          </div>
        )}
      </div>
      
      <div className="mt-4 text-sm text-gray-600">
        <p><strong>Instructions:</strong></p>
        <ol className="list-decimal list-inside space-y-1">
          <li>Click "Run Tests" to check system status</li>
          <li>If data is missing, click "Initialize Data"</li>
          <li>If issues persist, click "Clear Data" then "Initialize Data"</li>
          <li>Check browser console for detailed logs</li>
        </ol>
      </div>
    </div>
  );
};

export default DebugBooking;
