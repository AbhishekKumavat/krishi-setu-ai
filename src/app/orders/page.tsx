'use client';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Clock, Truck, PlusCircle, Leaf, ShieldCheck, Pencil, Trash2 } from 'lucide-react';
import { useUser } from '@/hooks/use-user';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { MOCK_PRODUCTS } from '@/components/features/customer-marketplace-client';

const MOCK_ORDERS = [
    { id: 'ORD-8923', product: 'Premium Red Onions (Jalgaon)', quantity: '50 kg', price: '₹1,100', status: 'Delivered', date: '24 Feb 2026', buyer: 'Ramesh Patil' },
    { id: 'ORD-8924', product: 'Fresh Spinach (Palak)', quantity: '10 kg', price: '₹400', status: 'In Transit', date: '26 Feb 2026', buyer: 'Anita M.' },
    { id: 'ORD-8925', product: 'Organic Green Peas', quantity: '25 kg', price: '₹1,500', status: 'Ordered', date: '28 Feb 2026', buyer: 'Kishore K.' },
];

export default function OrdersPage() {
    const { user } = useUser();
    const { toast } = useToast();
    const [orders, setOrders] = useState<any[]>([]);
    const [isMounted, setIsMounted] = useState(false);
    const [showListingForm, setShowListingForm] = useState(false);
    const [formLoading, setFormLoading] = useState(false);
    const [myListings, setMyListings] = useState<any[]>([]);
    const [editingId, setEditingId] = useState<string | null>(null); // null = new listing

    const [formData, setFormData] = useState({
        productId: '',        // maps to a MOCK_PRODUCTS id
        customName: '',       // if "other"
        pricePerKg: '',
        quantity: '',
        location: '',
        farmerName: '',
        phone: '',
        description: '',
    });

    const userEmail = user?.email;

    useEffect(() => {
        setIsMounted(true);
        const localFarmerOrders = JSON.parse(localStorage.getItem('farmer_orders') || '[]');
        if (userEmail === 'ramesh@gmail.com') {
            setOrders([...localFarmerOrders, ...MOCK_ORDERS]);
        } else {
            setOrders(MOCK_ORDERS);
        }
        // Load this farmer's listings
        const allListings = JSON.parse(localStorage.getItem('farmer_seller_listings') || '[]');
        const mine = allListings.filter((l: any) => l.farmerEmail === userEmail || !l.farmerEmail);
        setMyListings(mine);
    }, [userEmail]);

    if (!isMounted) return null;

    const selectedProduct = MOCK_PRODUCTS.find(p => p.id === formData.productId);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.productId || !formData.pricePerKg) {
            toast({ variant: 'destructive', title: 'Missing fields', description: 'Please select a product and enter your price.' });
            return;
        }
        setFormLoading(true);

        setTimeout(() => {
            const listing = {
                // Keep the same id if editing so it replaces in-place
                id: editingId ?? `fl-${Date.now()}`,
                productId: formData.productId,
                productName: selectedProduct?.name || formData.customName,
                farmerName: formData.farmerName || user?.displayName || 'Farmer',
                farmerEmail: userEmail,
                location: formData.location || 'Local Area',
                pricePerKg: parseFloat(formData.pricePerKg),
                quantity: formData.quantity,
                phone: formData.phone,
                description: formData.description,
                trustScore: 4.5,
                isVerified: false,
                distanceKm: 10,
                deliveryEstimate: '1-Day Delivery',
                updatedAt: new Date().toISOString(),
            };

            const existing: any[] = JSON.parse(localStorage.getItem('farmer_seller_listings') || '[]');

            let updated: any[];
            if (editingId) {
                // UPSERT: replace the entry with the same id
                updated = existing.map(e => e.id === editingId ? listing : e);
            } else {
                // INSERT: remove any old listing same farmer+product, then add
                const deduped = existing.filter(
                    e => !(e.productId === listing.productId && e.farmerEmail === userEmail)
                );
                updated = [...deduped, listing];
            }

            localStorage.setItem('farmer_seller_listings', JSON.stringify(updated));
            const mine = updated.filter((l: any) => l.farmerEmail === userEmail || !l.farmerEmail);
            setMyListings(mine);

            setFormLoading(false);
            setShowListingForm(false);
            setEditingId(null);
            setFormData({ productId: '', customName: '', pricePerKg: '', quantity: '', location: '', farmerName: '', phone: '', description: '' });
            toast({
                title: editingId ? '✅ Listing Updated!' : '🌿 Listing Live!',
                description: `"${listing.productName}" is now showing ₹${listing.pricePerKg}/kg to buyers.`,
            });
        }, 700);
    };

    const handleEdit = (listing: any) => {
        setFormData({
            productId: listing.productId,
            customName: listing.productName,
            pricePerKg: String(listing.pricePerKg),
            quantity: listing.quantity || '',
            location: listing.location || '',
            farmerName: listing.farmerName || '',
            phone: listing.phone || '',
            description: listing.description || '',
        });
        setEditingId(listing.id);
        setShowListingForm(true);
    };

    const handleDelete = (id: string) => {
        const existing: any[] = JSON.parse(localStorage.getItem('farmer_seller_listings') || '[]');
        const updated = existing.filter(e => e.id !== id);
        localStorage.setItem('farmer_seller_listings', JSON.stringify(updated));
        setMyListings(prev => prev.filter(l => l.id !== id));
        toast({ title: 'Listing removed', description: 'Your listing has been taken down from the marketplace.' });
    };

    return (
        <div className="space-y-6">

            {/* Header with List Your Produce button */}
            <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Farmer Orders Dashboard</h1>
                    <p className="text-muted-foreground mt-2">Manage your incoming produce shipments across {orders.length} orders.</p>
                </div>
                <Button
                    className="bg-emerald-600 hover:bg-emerald-700 font-bold shadow-md shadow-emerald-600/20 shrink-0"
                    onClick={() => setShowListingForm(true)}
                >
                    <PlusCircle className="mr-2 h-5 w-5" />
                    List Your Produce
                </Button>
            </div>

            {/* My Active Listings */}
            {myListings.length > 0 && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 space-y-3">
                    <h2 className="font-headline font-bold text-emerald-800 flex items-center gap-2">
                        <Leaf className="h-5 w-5" /> My Active Listings ({myListings.length})
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                        {myListings.map((l: any) => (
                            <div key={l.id} className="bg-white border border-emerald-100 rounded-xl p-3 shadow-sm">
                                <p className="font-bold text-sm truncate">{l.productName}</p>
                                <p className="text-emerald-700 font-bold text-lg">₹{l.pricePerKg}<span className="text-xs text-muted-foreground font-normal">/kg</span></p>
                                <p className="text-xs text-muted-foreground mt-1">{l.location} • {l.quantity ? `${l.quantity} kg avail.` : 'Qty not set'}</p>
                                <div className="flex items-center justify-between mt-2">
                                    <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 text-[10px]">Live on Marketplace</Badge>
                                    <div className="flex gap-1">
                                        <button
                                            onClick={() => handleEdit(l)}
                                            className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors"
                                            title="Edit listing"
                                        >
                                            <Pencil className="h-3.5 w-3.5" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(l.id)}
                                            className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition-colors"
                                            title="Delete listing"
                                        >
                                            <Trash2 className="h-3.5 w-3.5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Orders List */}
            <div className="grid gap-4">
                {orders.map((order) => (
                    <Card key={order.id} className="overflow-hidden hover:shadow-md transition-all">
                        <CardHeader className="bg-muted/30 pb-4">
                            <div className="flex justify-between items-center">
                                <div className="space-y-1">
                                    <CardTitle className="text-lg">Order #{order.id}</CardTitle>
                                    <p className="text-sm text-muted-foreground">Placed on {order.date}</p>
                                </div>
                                <Badge
                                    variant={order.status === 'Delivered' ? 'default' : order.status === 'In Transit' ? 'secondary' : 'outline'}
                                    className={`
                                        ${order.status === 'Delivered' && 'bg-green-600 hover:bg-green-700'}
                                        ${order.status === 'In Transit' && 'bg-blue-500 text-white hover:bg-blue-600'}
                                        ${order.status === 'Ordered' && 'border-amber-500 text-amber-600'}
                                    `}
                                >
                                    {order.status === 'Delivered' && <CheckCircle2 className="w-3 h-3 mr-1 inline" />}
                                    {order.status === 'In Transit' && <Truck className="w-3 h-3 mr-1 inline" />}
                                    {order.status === 'Ordered' && <Clock className="w-3 h-3 mr-1 inline" />}
                                    {order.status}
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                                <div className="space-y-1">
                                    <p className="font-semibold">{order.product}</p>
                                    <p className="text-sm text-muted-foreground">Buyer: {order.buyer}</p>
                                </div>
                                <div className="flex gap-8 border-l border-muted p-4">
                                    <div className="space-y-1 text-center">
                                        <p className="text-sm text-muted-foreground uppercase tracking-wider font-bold">Quantity</p>
                                        <p className="font-medium text-lg">{order.quantity}</p>
                                    </div>
                                    <div className="space-y-1 text-center">
                                        <p className="text-sm text-muted-foreground uppercase tracking-wider font-bold">Total Payout</p>
                                        <p className="font-bold text-lg text-green-700">{order.price}</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* ── List Your Produce Form Modal ─────────────────────────── */}
            <Dialog open={showListingForm} onOpenChange={setShowListingForm}>
                <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-headline flex items-center gap-2">
                            <Leaf className="h-5 w-5 text-emerald-600" /> List Your Produce
                        </DialogTitle>
                        <DialogDescription>
                            Select which product you're selling. Your offer will appear as a seller card on that product's marketplace page — buyers can compare your price directly.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-4 py-2">

                        {/* Product Selection */}
                        <div className="space-y-1.5">
                            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                Select Product <span className="text-red-500">*</span>
                            </Label>
                            <Select value={formData.productId} onValueChange={(v) => setFormData(p => ({ ...p, productId: v }))}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Choose which product you're selling..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {MOCK_PRODUCTS.map(p => (
                                        <SelectItem key={p.id} value={p.id}>
                                            {p.name} — <span className="text-muted-foreground text-xs">starts ₹{p.startingPrice}/kg</span>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {selectedProduct && (
                                <p className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-100 rounded px-3 py-1.5 mt-1">
                                    ✅ Your offer will show up on the <strong>{selectedProduct.name}</strong> product page as a seller card.
                                </p>
                            )}
                        </div>

                        {/* Price & Quantity */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label htmlFor="fl-price" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                    Your Price / kg (₹) <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="fl-price" type="number" min="1"
                                    placeholder={selectedProduct ? `e.g. ${selectedProduct.startingPrice}` : 'e.g. 35'}
                                    value={formData.pricePerKg}
                                    onChange={(e) => setFormData(p => ({ ...p, pricePerKg: e.target.value }))}
                                    required
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="fl-qty" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Available Qty (kg)</Label>
                                <Input id="fl-qty" type="number" min="1" placeholder="e.g. 200" value={formData.quantity} onChange={(e) => setFormData(p => ({ ...p, quantity: e.target.value }))} />
                            </div>
                        </div>

                        {/* Farmer Name & Location */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label htmlFor="fl-farmer" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Your Name</Label>
                                <Input id="fl-farmer" placeholder="e.g. Ramesh Patil" value={formData.farmerName} onChange={(e) => setFormData(p => ({ ...p, farmerName: e.target.value }))} />
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="fl-loc" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Location / Village</Label>
                                <Input id="fl-loc" placeholder="e.g. Nashik, MH" value={formData.location} onChange={(e) => setFormData(p => ({ ...p, location: e.target.value }))} />
                            </div>
                        </div>

                        {/* Phone */}
                        <div className="space-y-1.5">
                            <Label htmlFor="fl-phone" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Contact Number</Label>
                            <Input id="fl-phone" type="tel" placeholder="e.g. 9876543210" value={formData.phone} onChange={(e) => setFormData(p => ({ ...p, phone: e.target.value }))} />
                        </div>

                        {/* Description */}
                        <div className="space-y-1.5">
                            <Label htmlFor="fl-desc" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Description (optional)</Label>
                            <textarea
                                id="fl-desc"
                                className="w-full flex min-h-[70px] rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
                                placeholder="Variety, quality, harvest date, freshness guarantee..."
                                value={formData.description}
                                onChange={(e) => setFormData(p => ({ ...p, description: e.target.value }))}
                            />
                        </div>

                        <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 text-xs text-blue-700 flex items-start gap-2">
                            <ShieldCheck className="h-4 w-4 shrink-0 mt-0.5 text-blue-500" />
                            Your contact details (name, location, phone) will be visible to buyers comparing deals on the product page.
                        </div>

                        <DialogFooter className="pt-2 gap-2">
                            <Button type="button" variant="outline" onClick={() => setShowListingForm(false)}>Cancel</Button>
                            <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 font-bold px-8" disabled={formLoading}>
                                {formLoading ? 'Publishing...' : '🌿 Publish Listing'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
