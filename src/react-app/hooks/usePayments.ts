import { useState, useEffect } from 'react';
import { Payment } from '@/shared/types';

export function usePayments(customerId?: number) {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPayments = async () => {
    try {
      const url = customerId ? `/api/payments/${customerId}` : '/api/payments';
      const response = await fetch(url);
      const data = await response.json();
      setPayments(data);
    } catch (error) {
      console.error('Error fetching payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const createPayment = async (
    customer_id: number,
    amount_cop: number,
    amount_ves: number,
    exchange_rate: number,
    note: string,
    sale_id?: number
  ) => {
    try {
      const response = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customer_id, amount_cop, amount_ves, exchange_rate, note, sale_id })
      });
      const newPayment = await response.json();
      setPayments([newPayment, ...payments]);
      return newPayment;
    } catch (error) {
      console.error('Error creating payment:', error);
      throw error;
    }
  };

  const deletePayment = async (id: number) => {
    try {
      await fetch(`/api/payments/${id}`, { method: 'DELETE' });
      setPayments(payments.filter(p => p.id !== id));
    } catch (error) {
      console.error('Error deleting payment:', error);
      throw error;
    }
  };

  useEffect(() => {
    fetchPayments();
  }, [customerId]);

  return { payments, loading, createPayment, deletePayment, refresh: fetchPayments };
}
