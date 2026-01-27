import { useState, useEffect } from 'react';
import { SaleWithDetails } from '@/shared/types';

export function useSales() {
  const [sales, setSales] = useState<SaleWithDetails[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSales = async () => {
    try {
      const response = await fetch('/api/sales');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (Array.isArray(data)) {
        setSales(data);
      } else {
        console.error('API returned non-array data for sales:', data);
        setSales([]);
      }
    } catch (error) {
      console.error('Error fetching sales:', error);
      setSales([]);
    } finally {
      setLoading(false);
    }
  };

  const createSale = async (
    customer_id: number,
    items: { product_id: number; color_id: number; quantity: number; package_id?: number }[],
    paid_cop: number,
    paid_ves: number,
    exchange_rate: number,
    is_credit: boolean
  ) => {
    try {
      const response = await fetch('/api/sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customer_id, items, paid_cop, paid_ves, exchange_rate, is_credit })
      });
      const newSale = await response.json();
      setSales([newSale, ...sales]);
      return newSale;
    } catch (error) {
      console.error('Error creating sale:', error);
      throw error;
    }
  };

  const deleteSale = async (id: number) => {
    try {
      await fetch(`/api/sales/${id}`, { method: 'DELETE' });
      await fetchSales();
    } catch (error) {
      console.error('Error deleting sale:', error);
      throw error;
    }
  };



  useEffect(() => {
    fetchSales();
  }, []);

  return { sales, loading, createSale, deleteSale, refresh: fetchSales };
}
