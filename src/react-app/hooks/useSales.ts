import { useState, useEffect } from 'react';
import { SaleWithDetails } from '@/shared/types';

export function useSales() {
  const [sales, setSales] = useState<SaleWithDetails[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSales = async () => {
    try {
      const response = await fetch('/api/sales');
      const data = await response.json();
      setSales(data);
    } catch (error) {
      console.error('Error fetching sales:', error);
    } finally {
      setLoading(false);
    }
  };

  const createSale = async (
    customer_id: number,
    items: { product_id: number; color_id: number; quantity: number }[],
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
      setSales(sales.filter(s => s.id !== id));
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
