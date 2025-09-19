// Currency Exchange API Service
const CURRENCY_API_KEY = 'your_currency_api_key'; // Get from https://exchangerate-api.com/

export interface CurrencyData {
  base: string;
  rates: Record<string, number>;
  date: string;
}

export class CurrencyService {
  static async getExchangeRates(baseCurrency: string = 'USD'): Promise<CurrencyData> {
    try {
      const response = await fetch(
        `https://v6.exchangerate-api.com/v6/${CURRENCY_API_KEY}/latest/${baseCurrency}`
      );
      
      if (!response.ok) {
        throw new Error('Currency API request failed');
      }
      
      const data = await response.json();
      
      if (data.result !== 'success') {
        throw new Error(`Currency API Error: ${data.error_type}`);
      }
      
      return {
        base: data.base_code,
        rates: data.conversion_rates,
        date: data.time_last_update_utc
      };
    } catch (error) {
      console.error('Currency API Error:', error);
      throw error;
    }
  }

  static convertCurrency(
    amount: number, 
    fromCurrency: string, 
    toCurrency: string, 
    rates: Record<string, number>
  ): number {
    if (fromCurrency === toCurrency) return amount;
    
    // Convert to base currency first, then to target currency
    const baseRate = rates[fromCurrency] || 1;
    const targetRate = rates[toCurrency] || 1;
    
    return (amount / baseRate) * targetRate;
  }

  static formatCurrency(amount: number, currency: string): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(amount);
  }
}
