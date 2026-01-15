import { useState, useEffect } from 'react';
import { Color } from '@/shared/types';

export function useColors() {
  const [colors, setColors] = useState<Color[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchColors = async () => {
    try {
      const response = await fetch('/api/colors');
      const data = await response.json();
      setColors(data);
    } catch (error) {
      console.error('Error fetching colors:', error);
    } finally {
      setLoading(false);
    }
  };

  const createColor = async (name: string, hex_code: string) => {
    try {
      const response = await fetch('/api/colors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, hex_code })
      });
      const newColor = await response.json();
      setColors([...colors, newColor]);
      return newColor;
    } catch (error) {
      console.error('Error creating color:', error);
      throw error;
    }
  };

  const updateColor = async (id: number, name: string, hex_code: string) => {
    try {
      const response = await fetch(`/api/colors/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, hex_code })
      });
      const updatedColor = await response.json();
      setColors(colors.map(c => c.id === id ? updatedColor : c));
      return updatedColor;
    } catch (error) {
      console.error('Error updating color:', error);
      throw error;
    }
  };

  const deleteColor = async (id: number) => {
    try {
      await fetch(`/api/colors/${id}`, { method: 'DELETE' });
      setColors(colors.filter(c => c.id !== id));
    } catch (error) {
      console.error('Error deleting color:', error);
      throw error;
    }
  };

  useEffect(() => {
    fetchColors();
  }, []);

  return { colors, loading, createColor, updateColor, deleteColor, refresh: fetchColors };
}
