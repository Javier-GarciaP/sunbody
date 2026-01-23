import { useState, useEffect } from 'react';

export interface PackageStock {
    package_id: number;
    package_name: string;
    product_id: number;
    product_name: string;
    color_id: number;
    color_name: string;
    color_hex: string;
    initial_quantity: number;
    sold_quantity: number;
    available_quantity: number;
}

export function usePackageStock() {
    const [stock, setStock] = useState<PackageStock[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchStock = async () => {
        try {
            const response = await fetch('/api/packages/stock');
            const data = await response.json();
            setStock(data);
        } catch (error) {
            console.error('Error fetching package stock:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStock();
    }, []);

    return { stock, loading, refresh: fetchStock };
}
