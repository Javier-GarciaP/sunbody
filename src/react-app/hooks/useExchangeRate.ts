import { useState, useEffect } from 'react';
import { ExchangeRate } from '@/shared/types';

export function useExchangeRate() {
  const [rate, setRate] = useState<ExchangeRate | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchRate = async () => {
    try {
      const response = await fetch('/api/exchange-rate');
      const data = await response.json();
      setRate(data);
    } catch (error) {
      console.error('Error fetching exchange rate:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateRate = async (cop_to_ves: number) => {
    try {
      const response = await fetch('/api/exchange-rate', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cop_to_ves })
      });
      const updatedRate = await response.json();
      setRate(updatedRate);
      return updatedRate;
    } catch (error) {
      console.error('Error updating exchange rate:', error);
      throw error;
    }
  };

  useEffect(() => {
    fetchRate();
  }, []);

  return { rate, loading, updateRate, refresh: fetchRate };
}

export function convertCopToVes(cop: number, rate: number): number {
  return cop * rate;
}

export function convertVesToCop(ves: number, rate: number): number {
  return Math.round(ves / rate);
}
