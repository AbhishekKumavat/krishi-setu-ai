'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '../ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { ShieldCheck, Star, MapPin, Truck, Coins, Leaf, ArrowLeft, ArrowDown, Brain, TrendingUp, AlertTriangle } from 'lucide-react';
import Image from 'next/image';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { MOCK_PRODUCTS } from './customer-marketplace-client';
import { useUser } from '@/hooks/use-user';
import { calculateAIScore, analyzePriceTrend, analyzeDemand, calculateProfitOptimization, generateDashboardInsights } from '@/lib/ai/deal-recommender';

const MOCK_SELLERS = [
    { id: 's1', farmerName: 'Ramesh Patil', location: 'Jalgaon District', priceOffset: 0, distanceKm: 4, trustScore: 4.8, isVerified: true },
    { id: 's2', farmerName: 'Sunil Shinde', location: 'Bhusawal', priceOffset: -0.5, distanceKm: 12, trustScore: 4.5, isVerified: true },
    { id: 's3', farmerName: 'Kishore Agro', location: 'Pachora', priceOffset: -1.0, distanceKm: 45, trustScore: 4.2, isVerified: false },
    { id: 's4', farmerName: 'Vijay Farms', location: 'Yawal', priceOffset: +0.5, distanceKm: 2, trustScore: 5.0, isVerified: true },
    { id: 's5', farmerName: 'Ganesh Mali', location: 'Raver', priceOffset: -0.2, distanceKm: 18, trustScore: 4.4, isVerified: true },
    { id: 's6', farmerName: 'Santosh Chaudhari', location: 'Muktainagar', priceOffset: -0.8, distanceKm: 32, trustScore: 4.7, isVerified: true },
];

export function CustomerProductDetailClient({ passedProductId }: { passedProductId?: string }) {
    const params = useParams();
    const router = useRouter();
    const { user } = useUser();
    const { toast } = useToast();
    const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
    const [selectedDeal, setSelectedDeal] = useState<any>(null);
    const [selectedFarmerProfile, setSelectedFarmerProfile] = useState<any>(null);

    const [quantity, setQuantity] = useState('1');

    // Use passed ID from server page if available, else fallback to browser params lock
    const productId = passedProductId || (Array.isArray(params?.productId) ? params.productId[0] : params?.productId);
    const currentProduct = MOCK_PRODUCTS.find(p => p.id === productId) || MOCK_PRODUCTS[1];

    // Load farmer-submitted listings from localStorage for this product
    const [farmerListings, setFarmerListings] = useState<any[]>([]);
    useEffect(() => {
        const all = JSON.parse(localStorage.getItem('farmer_seller_listings') || '[]');
        const matched = all.filter((l: any) => l.productId === currentProduct.id);
        setFarmerListings(matched);
    }, [currentProduct.id]);

    // Merge mock sellers + farmer-submitted listings into one sellerData array
    const sellerData = [
        ...MOCK_SELLERS.map(seller => {
            const transportCost = seller.distanceKm * 0.07;
            const baseFarmerPrice = currentProduct.startingPrice + seller.priceOffset;
            const finalPrice = baseFarmerPrice + transportCost;
            let deliveryEstimate = '2 Days';
            if (seller.distanceKm < 5) deliveryEstimate = 'Same Day Delivery';
            else if (seller.distanceKm <= 15) deliveryEstimate = '1-Day Delivery';
            return {
                id: seller.id,
                farmerName: seller.farmerName,
                location: seller.location,
                pricePerKg: baseFarmerPrice,
                distanceKm: seller.distanceKm,
                trustScore: seller.trustScore,
                deliveryEstimate,
                isVerified: seller.isVerified,
                transportCost,
                finalPrice,
            };
        }),
        // Farmer-submitted listings injected as extra seller cards
        ...farmerListings.map(l => ({
            id: l.id,
            farmerName: l.farmerName,
            location: l.location,
            pricePerKg: l.pricePerKg,
            distanceKm: l.distanceKm ?? 10,
            trustScore: l.trustScore ?? 4.0,
            deliveryEstimate: l.deliveryEstimate ?? '1-Day Delivery',
            isVerified: false,
            transportCost: (l.distanceKm ?? 10) * 0.07,
            finalPrice: l.pricePerKg + (l.distanceKm ?? 10) * 0.07,
            isNewListing: true,
            phone: l.phone,
            description: l.description,
            quantity: l.quantity,
        })),
    ];

    // AI Price Trend Analysis (simulated data)
    const historicalPrices = [
        currentProduct.startingPrice * 0.95,
        currentProduct.startingPrice * 0.97,
        currentProduct.startingPrice * 0.98,
        currentProduct.startingPrice * 1.02,
        currentProduct.startingPrice * 1.05,
        currentProduct.startingPrice * 1.03,
        currentProduct.startingPrice * 1.01
    ];

    const priceTrend = analyzePriceTrend(historicalPrices, currentProduct.startingPrice);

    // Enhanced AI Demand Intelligence with Dynamic Classification
    const productViews = Math.floor(Math.random() * 1500) + 200;
    const stockLevel: 'high' | 'medium' | 'low' = productViews > 1000 ? 'low' : productViews > 500 ? 'medium' : 'high';
    const demandIndicator = analyzeDemand(productViews, stockLevel, priceTrend.trend);

    // Apply Enhanced AI Deal Recommendation Engine with Dynamic Scoring
    const aiRankedSellers = calculateAIScore(sellerData, {
        avgMarketPrice: currentProduct.startingPrice,
        productViews: productViews,
        stockLevel: stockLevel
    });

    // AI Profit Optimization
    const mandiPrice = currentProduct.startingPrice * 0.95; // Simulated mandi price
    const profitOptimization = calculateProfitOptimization(mandiPrice, currentProduct.startingPrice);

    return (
        <div className="space-y-6 pb-20">

            {/* Back Header */}
            <button onClick={() => router.back()} className="text-muted-foreground hover:text-primary flex items-center font-medium transition-colors">
                <ArrowLeft className="h-4 w-4 mr-2" /> Back to Marketplace
            </button>

            {/* Main Product Banner */}
            <div className="bg-card border rounded-2xl overflow-hidden shadow-sm flex flex-col md:flex-row items-center p-6 gap-8 relative">
                <div className="md:w-1/3 aspect-video relative rounded-xl overflow-hidden shadow-inner border border-muted-foreground/10 bg-muted shrink-0 w-full">
                    {/* Fallback pattern if no image matching ID */}
                    <div className="absolute inset-0 bg-primary/10 flex items-center justify-center">
                        <Leaf className="h-20 w-20 text-primary/30" />
                    </div>
                    <Image
                        src={currentProduct.image}
                        alt={currentProduct.name}
                        fill
                        className="object-cover relative z-10"
                    />
                </div>

                <div className="flex-1 w-full space-y-4">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-200 border-amber-200 shadow-none px-3">Live Comparison Active</Badge>
                            <Badge className="bg-purple-100 text-purple-800 border-purple-200 shadow-none px-3 flex items-center gap-1">
                                <Brain className="h-3 w-3" /> AI-Powered
                            </Badge>
                        </div>
                        <h1 className="font-headline text-3xl font-bold tracking-tight">{currentProduct.name}</h1>
                        <p className="text-muted-foreground flex items-center gap-2"><MapPin className="h-4 w-4" /> Delivered fresh to your location.</p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
                        <div className="space-y-1">
                            <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Avg Market Price</p>
                            <p className="text-lg font-bold">₹{(currentProduct.startingPrice + 1.5).toFixed(2)} <span className="text-sm font-normal text-muted-foreground">/ kg</span></p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-xs text-green-700 font-semibold uppercase tracking-wider">Lowest Deal Starts</p>
                            <p className="text-lg font-bold text-green-700">₹{aiRankedSellers[0].pricePerKg.toFixed(0)} <span className="text-sm font-normal opacity-70">inc. transport</span></p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Est. Fastest Delivery</p>
                            <p className="text-lg font-bold flex items-center gap-1.5"><Truck className="h-4 w-4 text-blue-500" /> Same Day</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Verified Farmers</p>
                            <p className="text-lg font-bold flex items-center gap-1.5"><ShieldCheck className="h-4 w-4" /> {MOCK_SELLERS.length} Direct</p>
                        </div>
                    </div>
                </div>
            </div>



            {/* Comparison Deals Section */}
            <div className="space-y-4 pt-4">
                <div className="flex items-center gap-2 justify-between mb-6">
                    <h2 className="text-2xl font-headline font-semibold">Compare Deals</h2>
                    <div className="flex items-center text-xs text-muted-foreground bg-muted px-3 py-1.5 rounded-full font-medium">AI-Ranked by Best Value <ArrowDown className="h-3 w-3 ml-1" /></div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {aiRankedSellers.map((seller: any, index) => {
                        const isBestDeal = index === 0;
                        const isAIRecommended = seller.isRecommended;

                        return (
                            <Card key={seller.id} className={`flex flex-col h-full overflow-hidden transition-all duration-300 shadow-sm hover:shadow-md border-2 ${isAIRecommended ? 'border-purple-400 bg-purple-50/10' : isBestDeal ? 'border-amber-400 bg-amber-50/10' : 'border-transparent hover:border-border'}`}>
                                {isAIRecommended && (
                                    <div className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white text-xs font-bold px-4 py-1.5 flex items-center justify-center uppercase tracking-widest shadow-sm shrink-0">
                                        <Brain className="h-3 w-3 mr-1" /> AI Recommended 🔥
                                    </div>
                                )}
                                {isBestDeal && !isAIRecommended && (
                                    <div className="bg-gradient-to-r from-amber-400 to-orange-500 text-white text-xs font-bold px-4 py-1.5 flex items-center justify-center uppercase tracking-widest shadow-sm shrink-0">
                                        Best Deal 🔥
                                    </div>
                                )}
                                <CardContent className="p-5 flex-1 flex flex-col space-y-4">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3
                                                className="font-bold text-lg flex items-center gap-1 cursor-pointer hover:text-green-700 hover:underline decoration-green-700/50 underline-offset-4 transition-all"
                                                onClick={() => setSelectedFarmerProfile(seller)}
                                            >
                                                {seller.farmerName}
                                                {seller.isVerified && <ShieldCheck className="h-4 w-4 text-blue-500 shrink-0" />}
                                            </h3>
                                            <p className="text-sm text-muted-foreground flex items-center gap-1 mt-0.5"><MapPin className="h-3 w-3" /> {seller.location}</p>
                                        </div>
                                        <div className="flex items-center bg-green-100 text-green-800 px-2 py-0.5 rounded text-sm font-bold shadow-sm border border-green-200">
                                            <Star className="h-3 w-3 mr-1 fill-green-700" />
                                            {seller.trustScore.toFixed(1)}
                                        </div>
                                    </div>

                                    <div className="space-y-2.5 bg-muted/30 p-4 rounded-xl text-sm border flex-1">
                                        <div className="flex justify-between text-muted-foreground">
                                            <span>Farm Base Price</span>
                                            <span className="font-medium text-foreground">₹{seller.pricePerKg.toFixed(2)}/kg</span>
                                        </div>
                                        <div className="flex justify-between text-muted-foreground items-center">
                                            <span className="flex items-center gap-1.5"><Truck className="h-3.5 w-3.5" /> Transport ({seller.distanceKm}km)</span>
                                            <span className="font-medium text-foreground">+₹{(seller.distanceKm * 0.07).toFixed(2)}</span>
                                        </div>
                                        <div className="h-px bg-border my-2 w-full"></div>
                                        <div className="flex justify-between font-bold text-lg text-emerald-700 py-1">
                                            <span>Final Delivered Price</span>
                                            <span>₹{(seller.pricePerKg + (seller.distanceKm * 0.07)).toFixed(2)}</span>
                                        </div>
                                        <div className="pt-2 border-t border-border/50">
                                            <div className="flex justify-between items-center">
                                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                    <Brain className="h-3 w-3" /> AI Score
                                                </span>
                                                <span className="text-xs font-bold bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
                                                    {(seller.aiScore * 100).toFixed(1)}%
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between mt-auto pt-2">
                                        <p className="text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100">{seller.deliveryEstimate}</p>
                                        <Button size="sm" className="bg-[#16a34a] hover:bg-green-700 font-bold px-6 shadow-md" onClick={() => {
                                            setSelectedDeal(seller);
                                            setCheckoutModalOpen(true);
                                        }}>
                                            Buy Now
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        )
                    })}
                </div>
            </div>

            {/* FARMER PROFILE MODAL */}
            <Dialog open={!!selectedFarmerProfile} onOpenChange={() => setSelectedFarmerProfile(null)}>
                <DialogContent className="sm:max-w-[450px] p-0 overflow-hidden bg-card border-none shadow-2xl">
                    <DialogTitle className="sr-only">Farmer Profile</DialogTitle>
                    <DialogDescription className="sr-only">Details about the farmer</DialogDescription>

                    {selectedFarmerProfile && (
                        <>
                            <div className="bg-emerald-700 p-6 text-white pb-8 relative">
                                <div className="flex items-center gap-4 mt-2">
                                    <div className="h-16 w-16 rounded-full border-4 border-white overflow-hidden bg-white/20 shrink-0 shadow-lg relative">
                                        <div className="w-full h-full flex items-center justify-center text-2xl font-black bg-emerald-800 text-emerald-100">
                                            {selectedFarmerProfile.farmerName.charAt(0)}
                                        </div>
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold font-headline flex items-center gap-1.5">
                                            {selectedFarmerProfile.farmerName}
                                            {selectedFarmerProfile.isVerified && <ShieldCheck className="h-5 w-5 text-blue-300" />}
                                        </h2>
                                        <p className="text-emerald-100 flex items-center gap-1 mt-1 text-sm"><MapPin className="h-4 w-4" /> {selectedFarmerProfile.location}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 space-y-6 bg-card -mt-4 rounded-t-3xl relative">
                                {/* Stats */}
                                <div className="flex bg-muted/50 rounded-xl p-4 divide-x border shadow-sm">
                                    <div className="flex-1 text-center">
                                        <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Trust Score</p>
                                        <p className="text-2xl font-bold text-green-700 flex items-center justify-center gap-1 mt-0.5">
                                            <Star className="h-5 w-5 fill-green-700" /> {selectedFarmerProfile.trustScore.toFixed(1)}
                                        </p>
                                    </div>
                                    <div className="flex-1 text-center">
                                        <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Verified Orders</p>
                                        <p className="text-2xl font-bold mt-0.5 text-foreground">{Math.floor(Math.random() * 200) + 50}</p>
                                    </div>
                                </div>

                                {/* Reviews */}
                                <div>
                                    <h3 className="font-bold text-lg mb-3">Recent Reviews</h3>
                                    <div className="space-y-3">
                                        <div className="bg-background border rounded-lg p-3 text-sm">
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="font-semibold text-foreground">Rajesh K.</span>
                                                <div className="flex text-amber-500">
                                                    <Star className="h-3 w-3 fill-current" /><Star className="h-3 w-3 fill-current" /><Star className="h-3 w-3 fill-current" /><Star className="h-3 w-3 fill-current" /><Star className="h-3 w-3 fill-current" />
                                                </div>
                                            </div>
                                            <p className="text-muted-foreground">Excellent quality produce. Delivered on time and packaging was perfect.</p>
                                        </div>
                                        <div className="bg-background border rounded-lg p-3 text-sm">
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="font-semibold text-foreground">Anita M.</span>
                                                <div className="flex text-amber-500">
                                                    <Star className="h-3 w-3 fill-current" /><Star className="h-3 w-3 fill-current" /><Star className="h-3 w-3 fill-current" /><Star className="h-3 w-3 fill-current" />
                                                </div>
                                            </div>
                                            <p className="text-muted-foreground">Good prices compared to the market. Very fresh.</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Other Products */}
                                <div className="pb-4">
                                    <h3 className="font-bold text-lg mb-3">Other Listings by {selectedFarmerProfile.farmerName.split(' ')[0]}</h3>
                                    <div className="grid grid-cols-2 gap-3">
                                        {[
                                            { id: 'rice-basmati', n: 'Premium Basmati Rice', p: 85, img: '/basmati.jpg' },
                                            { id: 'spinach-fresh', n: 'Fresh Spinach', p: 40, img: '/spinach.jpg' },
                                        ].map((prod, i) => (
                                            <div
                                                key={i}
                                                onClick={() => {
                                                    setSelectedFarmerProfile(null);
                                                    router.push(`/customer-marketplace/${prod.id}`);
                                                }}
                                                className="border rounded-xl overflow-hidden shadow-sm group cursor-pointer hover:border-primary/50 hover:shadow-md transition-all bg-background"
                                            >
                                                <div className="relative h-24 w-full bg-muted">
                                                    <Image src={prod.img} alt={prod.n} fill className="object-cover group-hover:scale-105 transition-transform" />
                                                </div>
                                                <div className="p-2.5">
                                                    <p className="font-bold text-sm line-clamp-1 group-hover:text-primary transition-colors">{prod.n}</p>
                                                    <p className="text-green-700 font-bold text-sm mt-1">₹{prod.p} <span className="text-muted-foreground text-xs font-normal">/kg</span></p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </DialogContent>
            </Dialog>

            {/* CHECKOUT MODAL */}
            <Dialog open={checkoutModalOpen} onOpenChange={setCheckoutModalOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader className="border-b pb-4 mb-4">
                        <DialogTitle className="text-xl">Express Checkout</DialogTitle>
                        <DialogDescription>
                            Complete your order with {selectedDeal?.farmerName}.
                        </DialogDescription>
                    </DialogHeader>

                    {selectedDeal && (
                        <div className="space-y-5 py-2">
                            <div className="flex justify-between items-center bg-green-50 p-4 rounded-xl border border-green-100 shadow-inner">
                                <div className="space-y-1">
                                    <p className="text-xs text-green-800 uppercase font-black tracking-wider">Unit Price</p>
                                    <p className="font-bold text-green-900 text-xl font-headline">₹{(selectedDeal.pricePerKg + (selectedDeal.distanceKm * 0.07)).toFixed(0)}</p>
                                </div>
                                <div className="text-right space-y-1">
                                    <p className="text-xs text-green-800 uppercase font-black tracking-wider">Grand Total</p>
                                    <p className="font-bold text-green-900 text-2xl font-headline">₹{((selectedDeal.pricePerKg + (selectedDeal.distanceKm * 0.07)) * parseInt(quantity || '1')).toFixed(0)}</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="qty" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Quantity (kg)</Label>
                                    <Input
                                        id="qty"
                                        type="number"
                                        value={quantity}
                                        onChange={(e) => setQuantity(e.target.value)}
                                        min="1"
                                        className="font-bold text-lg"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="address" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Delivery Address</Label>
                                    <textarea
                                        id="address"
                                        className="w-full flex min-h-[80px] rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 resize-none font-medium"
                                        placeholder="Enter your full street address..."
                                    ></textarea>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Payment Method</Label>
                                    <div className="flex gap-2">
                                        <div className="flex-1 bg-primary/10 border-2 border-primary text-primary font-bold rounded-lg p-3 text-center cursor-pointer text-sm shadow-sm transition-transform active:scale-95">
                                            Cash on Delivery
                                        </div>
                                        <div className="flex-1 border-2 border-border text-muted-foreground font-medium rounded-lg p-3 text-center cursor-pointer text-sm hover:border-primary/50 transition-colors">
                                            UPI Payment
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <DialogFooter className="border-t pt-4 mt-2">
                        <Button
                            variant="outline"
                            onClick={() => setCheckoutModalOpen(false)}
                            className="w-full sm:w-auto"
                        >
                            Cancel
                        </Button>
                        <Button
                            className="w-full bg-[#16a34a] hover:bg-green-700 font-bold shadow-md shadow-green-600/20"
                            onClick={() => {
                                // ADD TO LOCAL STORAGE FOR FARMER DASHBOARD TO SEE
                                if (selectedDeal) {
                                    const existingOrders = JSON.parse(localStorage.getItem('farmer_orders') || '[]');
                                    const newOrder = {
                                        id: `ORD-${Math.floor(Math.random() * 10000)}`,
                                        farmerId: selectedDeal.id, // important to match 's1'
                                        farmerName: selectedDeal.farmerName,
                                        product: currentProduct.name,
                                        quantity: `${quantity} kg`,
                                        price: `₹${((selectedDeal.pricePerKg + (selectedDeal.distanceKm * 0.07)) * parseInt(quantity || '1')).toFixed(0)}`,
                                        status: 'Ordered',
                                        date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
                                        buyer: user?.displayName || 'Guest Customer',
                                        buyerLocation: user?.region || 'Home Delivery',
                                    };
                                    // Store for Farmer Dashboard
                                    localStorage.setItem('farmer_orders', JSON.stringify([newOrder, ...existingOrders]));
                                    // Store for Customer Dashboard
                                    const existingCustomerOrders = JSON.parse(localStorage.getItem('customer_orders') || '[]');
                                    localStorage.setItem('customer_orders', JSON.stringify([newOrder, ...existingCustomerOrders]));
                                }

                                toast({
                                    title: "Order Placed Successfully! 🎉",
                                    description: `Your order for ${quantity} kg has been sent to ${selectedDeal?.farmerName}.`,
                                });
                                setCheckoutModalOpen(false);
                            }}
                        >
                            Confirm Order
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
