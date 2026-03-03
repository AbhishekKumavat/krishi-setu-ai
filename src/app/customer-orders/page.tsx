'use client';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Clock, Truck, MapPin, Search } from 'lucide-react';
import { useUser } from '@/hooks/use-user';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function CustomerOrdersPage() {
    const { user } = useUser();
    const [orders, setOrders] = useState<any[]>([]);
    const [isMounted, setIsMounted] = useState(false);

    // Extract primitive to prevent deep-object re-renders in hook
    const userEmail = user?.email;

    useEffect(() => {
        setIsMounted(true);
        // Load real-time orders directed at this mock backend instance from LocalStorage
        const localCustomerOrders = JSON.parse(localStorage.getItem('customer_orders') || '[]');
        setOrders(localCustomerOrders);
    }, [userEmail]);

    if (!isMounted) return null;

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">My Purchases</h1>
                    <p className="text-muted-foreground mt-2">Track the status of your farm-fresh grocery orders.</p>
                </div>
                <Link href="/customer-marketplace">
                    <Button variant="outline" className="border-primary text-primary hover:bg-primary/10">
                        <Search className="w-4 h-4 mr-2" /> Continue Shopping
                    </Button>
                </Link>
            </div>

            {orders.length === 0 ? (
                <div className="text-center py-20 bg-muted/20 rounded-2xl border border-dashed border-border mt-8">
                    <Truck className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-foreground">No orders yet</h3>
                    <p className="text-muted-foreground mt-2 max-w-sm mx-auto">Looks like you haven't bought any fresh produce yet. Head back to the marketplace to explore great deals.</p>
                    <Link href="/customer-marketplace">
                        <Button className="mt-6 bg-[#16a34a] hover:bg-green-700 font-bold shadow-md shadow-green-600/20">
                            Start Shopping
                        </Button>
                    </Link>
                </div>
            ) : (
                <div className="grid gap-6 mt-8">
                    {orders.map((order, idx) => (
                        <Card key={idx} className="overflow-hidden hover:shadow-lg transition-all border-border shadow-sm">
                            <CardHeader className="bg-primary/5 pb-4 border-b border-primary/10">
                                <div className="flex justify-between items-center">
                                    <div className="space-y-1">
                                        <CardTitle className="text-lg font-headline font-bold text-foreground">Order #{order.id}</CardTitle>
                                        <p className="text-sm font-medium text-muted-foreground">Placed on {order.date}</p>
                                    </div>
                                    <Badge
                                        variant={order.status === 'Delivered' ? 'default' : order.status === 'In Transit' ? 'secondary' : 'outline'}
                                        className={`
                                            px-3 py-1 text-sm font-semibold shadow-sm border
                                            ${order.status === 'Delivered' ? 'bg-green-600 hover:bg-green-700 border-green-700 text-white' : ''}
                                            ${order.status === 'In Transit' ? 'bg-blue-500 text-white hover:bg-blue-600 border-blue-600' : ''}
                                            ${order.status === 'Ordered' ? 'bg-amber-100 border-amber-300 text-amber-800' : ''}
                                        `}
                                    >
                                        {order.status === 'Delivered' && <CheckCircle2 className="w-4 h-4 mr-1.5 inline" />}
                                        {order.status === 'In Transit' && <Truck className="w-4 h-4 mr-1.5 inline" />}
                                        {order.status === 'Ordered' && <Clock className="w-4 h-4 mr-1.5 inline text-amber-600" />}
                                        {order.status}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <div className="flex flex-col md:flex-row justify-between md:items-center gap-6">
                                    <div className="space-y-3 flex-1">
                                        <div className="bg-background rounded-lg p-3 border shadow-sm">
                                            <p className="text-xs text-primary uppercase font-bold tracking-wider mb-1">Items</p>
                                            <p className="font-bold text-lg text-foreground leading-tight">{order.product}</p>
                                            <p className="text-sm text-muted-foreground mt-1">Quantity: <span className="font-semibold">{order.quantity}</span></p>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium ml-1">
                                            <MapPin className="w-4 h-4 text-emerald-600" /> Sold by: <span className="text-foreground font-bold">{order.farmerName}</span>
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center md:flex-col md:items-end gap-3 md:gap-4 md:border-l md:border-muted md:pl-8 py-2">
                                        <div className="space-y-1 md:text-right">
                                            <p className="text-xs text-muted-foreground uppercase tracking-wider font-bold">Total Paid</p>
                                            <p className="font-black text-2xl text-emerald-700">{order.price}</p>
                                        </div>
                                        <Button variant="ghost" size="sm" className="hidden md:flex text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50">View Invoice</Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
