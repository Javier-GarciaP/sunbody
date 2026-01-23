import { useState, useEffect } from 'react';
import { Customer } from '@/shared/types';

export function useCustomers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCustomers = async () => {
    try {
      const response = await fetch('/api/customers');
      const data = await response.json();
      setCustomers(data);
    } catch (error) {
      console.error('Error fetching customers:', error);
    } finally {
      setLoading(false);
    }
  };

  const createCustomer = async (name: string, phone: string) => {
    try {
      const response = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone })
      });
      const newCustomer = await response.json();
      setCustomers([...customers, newCustomer]);
      return newCustomer;
    } catch (error) {
      console.error('Error creating customer:', error);
      throw error;
    }
  };

  const updateCustomer = async (id: number, name: string, phone: string) => {
    try {
      const response = await fetch(`/api/customers/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone })
      });
      const updatedCustomer = await response.json();
      setCustomers(customers.map(c => c.id === id ? updatedCustomer : c));
      return updatedCustomer;
    } catch (error) {
      console.error('Error updating customer:', error);
      throw error;
    }
  };

  const deleteCustomer = async (id: number) => {
    try {
      const response = await fetch(`/api/customers/${id}`, { method: 'DELETE' });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al eliminar el cliente');
      }
      setCustomers(customers.filter(c => c.id !== id));
    } catch (error: any) {
      console.error('Error deleting customer:', error);
      throw error;
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  return { customers, loading, createCustomer, updateCustomer, deleteCustomer, refresh: fetchCustomers };
}
