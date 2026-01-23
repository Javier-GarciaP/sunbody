import { useState, useEffect } from 'react';
import { OrderWithItems } from '@/shared/types';

export function useOrders() {
    const [orders, setOrders] = useState<OrderWithItems[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchOrders = async () => {
        try {
            const response = await fetch('/api/orders');
            const data = await response.json();
            setOrders(data);
        } catch (error) {
            console.error('Error fetching orders:', error);
        } finally {
            setLoading(false);
        }
    };

    const createOrder = async (customer_id: number | null, items: { product_id: number; color_id: number; quantity: number }[], note?: string, prepayment_cop?: number) => {
        try {
            const response = await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ customer_id, items, note, prepayment_cop: prepayment_cop || 0 })
            });
            const newOrder = await response.json();
            setOrders([newOrder, ...orders]);
            return newOrder;
        } catch (error) {
            console.error('Error creating order:', error);
            throw error;
        }
    };

    const updateItemStatus = async (itemId: number, isPurchased: boolean) => {
        try {
            await fetch(`/api/orders/items/${itemId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ is_purchased: isPurchased })
            });
            setOrders(orders.map(o => ({
                ...o,
                items: o.items.map(i => i.id === itemId ? { ...i, is_purchased: isPurchased } : i)
            })));
        } catch (error) {
            console.error('Error updating item status:', error);
        }
    };

    const closePackageFromOrders = async (name: string, totalVes: number, itemIds: number[]) => {
        try {
            const response = await fetch('/api/orders/batch-package', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, total_ves: totalVes, itemIds })
            });
            if (!response.ok) throw new Error('Error closing package');
            await fetchOrders();
        } catch (error) {
            console.error('Error batching items into package:', error);
            throw error;
        }
    };

    const deliverOrderItems = async (orderIds: number[], itemIds: number[], isCredit: boolean, exchangeRate: number, additionalPayment: number = 0) => {
        try {
            const response = await fetch('/api/orders/deliver', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ orderIds, itemIds, is_credit: isCredit, exchangeRate, additional_payment: additionalPayment })
            });
            if (!response.ok) throw new Error('Error delivering items');
            await fetchOrders();
        } catch (error) {
            console.error('Error delivering order items:', error);
            throw error;
        }
    };

    const deleteOrder = async (id: number) => {
        try {
            await fetch(`/api/orders/${id}`, { method: 'DELETE' });
            setOrders(orders.filter(o => o.id !== id));
        } catch (error) {
            console.error('Error deleting order:', error);
            throw error;
        }
    };

    const deleteOrderItem = async (itemId: number) => {
        try {
            await fetch(`/api/orders/items/${itemId}`, { method: 'DELETE' });
            setOrders(orders.map(o => ({
                ...o,
                items: o.items.filter(i => i.id !== itemId)
            })).filter(o => o.items.length > 0 || o.prepayment_cop > 0));
            // Keep order if it has items or a prepayment (maybe?)
            // Actually, if an order becomes empty it's better to refresh or let the filter handle it.
            // But if all items are gone, should the order vanish? Probably yes if no prepayment.
        } catch (error) {
            console.error('Error deleting order item:', error);
            throw error;
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    return { orders, loading, createOrder, updateItemStatus, closePackageFromOrders, deliverOrderItems, deleteOrder, deleteOrderItem, refresh: fetchOrders };
}
