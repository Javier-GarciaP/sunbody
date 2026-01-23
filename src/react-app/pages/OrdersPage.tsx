import OrderManager from '@/react-app/components/OrderManager';

export default function OrdersPage() {
    return (
        <div className="space-y-4 animate-fade-in">
            <div>
                <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">Pedidos</h1>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Gestión de pedidos por cliente</p>
            </div>
            <OrderManager />
        </div>
    );
}
