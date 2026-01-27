import { useState, useEffect } from 'react';
import { PackageWithItems } from '@/shared/types';

export function usePackages() {
  const [packages, setPackages] = useState<PackageWithItems[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPackages = async () => {
    try {
      const response = await fetch('/api/packages');
      const data = await response.json();
      setPackages(data);
    } catch (error) {
      console.error('Error fetching packages:', error);
    } finally {
      setLoading(false);
    }
  };

  const createPackage = async (name: string, items: { product_id: number; color_id: number; quantity: number }[], total_ves: number = 0) => {
    try {
      const response = await fetch('/api/packages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, items, total_ves })
      });
      const newPackage = await response.json();
      setPackages([newPackage, ...packages]);
      return newPackage;
    } catch (error) {
      console.error('Error creating package:', error);
      throw error;
    }
  };

  const updatePackage = async (id: number, data: { name?: string; items?: any[]; status?: string; total_ves?: number }) => {
    try {
      const response = await fetch(`/api/packages/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const updatedPackage = await response.json();
      setPackages(packages.map(p => p.id === id ? updatedPackage : p));
      return updatedPackage;
    } catch (error) {
      console.error('Error updating package:', error);
      throw error;
    }
  };

  const updatePackageStatus = async (id: number, status: string) => {
    return updatePackage(id, { status });
  };

  const deletePackage = async (id: number) => {
    try {
      const response = await fetch(`/api/packages/${id}`, { method: 'DELETE' });
      if (!response.ok) {
        const errorData = await response.json() as any;
        throw new Error(errorData.error || 'Error al eliminar el paquete');
      }
      setPackages(packages.filter(p => p.id !== id));
    } catch (error) {
      console.error('Error deleting package:', error);
      throw error;
    }
  };

  useEffect(() => {
    fetchPackages();
  }, []);

  return { packages, loading, createPackage, updatePackage, updatePackageStatus, deletePackage, refresh: fetchPackages };
}
