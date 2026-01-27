import { useState, useEffect } from 'react';
import { ProductWithVariants } from '@/shared/types';

export function useProducts() {
  const [products, setProducts] = useState<ProductWithVariants[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (Array.isArray(data)) {
        setProducts(data);
      } else {
        console.error('API returned non-array data for products:', data);
        setProducts([]);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const createProduct = async (name: string, price_cop: number, image_url?: string | null, variants: { color_id: number; stock: number }[] = []) => {
    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, price_cop, image_url, variants })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Error al crear producto');

      setProducts([...products, data]);
      return data;
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  };

  const updateProduct = async (id: number, name: string, price_cop: number, image_url?: string | null, variants?: { color_id: number; stock: number }[]) => {
    try {
      const response = await fetch(`/api/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, price_cop, image_url, variants })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Error al actualizar producto');

      setProducts(products.map(p => p.id === id ? data : p));
      return data;
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  };

  const deleteProduct = async (id: number) => {
    try {
      await fetch(`/api/products/${id}`, { method: 'DELETE' });
      setProducts(products.filter(p => p.id !== id));
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return { products, loading, createProduct, updateProduct, deleteProduct, refresh: fetchProducts };
}
