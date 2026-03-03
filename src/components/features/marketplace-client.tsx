'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { MapPin, Navigation, Star, ShieldCheck, Phone, CheckCircle, Truck, TrendingUp, Info, Loader2, ArrowUpRight, ArrowDownRight, Brain } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { getAllRetailers } from '@/app/retailer/data-service';

// ─── TYPES ─────────────────────────────────────────────────────────────
type RetailerType = {
    id: string;
    name: string;
    type?: string;
    lat?: number;
    lon?: number;
    offeredPrice?: number; // per quintal
    trustScore?: number;
    isVerified: boolean;
    image: string;
    address?: string;
    phone: string;
    paymentTerms?: string;
    location: string;
    rating: number;
    reviewsCount: number;
    mapsLink?: string;
    iframeLink?: string;
    stock: Array<{
        id: string;
        name: string;
        pricePerKg: number;
        quantity: string;
    }>;
};

type ProcessedRetailer = {
    id: string;
    name: string;
    type: string;
    lat: number;
    lon: number;
    offeredPrice: number; // per quintal
    trustScore: number;
    isVerified: boolean;
    image: string;
    address: string;
    phone: string;
    paymentTerms: string;
    distance?: number;
    transportCost?: number;
    netProfit?: number;
};

// ─── TRANSFORMED RETAILER DATA ──────────────────────────────────
// transformRetailers: extracts lat/lon coordinates only (no price — price is crop-specific)
const transformRetailers = (): ProcessedRetailer[] => {
    const retailers = getAllRetailers();
    return retailers.map(retailer => {
        const coordsMatch = retailer.iframeLink?.match(/!2d(-?\d+\.\d+)!3d(-?\d+\.\d+)/);
        let lat = 20.9951;
        let lon = 75.5770;
        if (coordsMatch) {
            lat = parseFloat(coordsMatch[2]);
            lon = parseFloat(coordsMatch[1]);
        }
        return {
            id: retailer.id,
            name: retailer.name,
            type: 'Wholesale Market',
            lat, lon,
            offeredPrice: 0,          // filled per-crop in calculateRetailersAndSort
            trustScore: retailer.rating,
            isVerified: retailer.verified,
            image: retailer.image,
            address: retailer.location,
            phone: retailer.contact,
            paymentTerms: 'Cash / UPI / Bank Transfer',
        };
    });
};

// Maps the crop selector key → the stock item name saved by the retailer dashboard
const CROP_KEY_TO_NAME: Record<string, string[]> = {
    wheat: ['Wheat', 'wheat'],
    onion: ['Onions', 'Onion', 'onion'],
    soy: ['Soybean', 'Soy', 'soy', 'Soya'],
    cotton: ['Cotton', 'cotton'],
};

const CROP_MARKET_DATA: Record<string, { label: string, min: number, avg: number, max: number, minTrend: string, avgTrend: string, maxTrend: string, positiveMin: boolean, positiveAvg: boolean, positiveMax: boolean }> = {
    'onion': { label: 'Red Onion (Jalgaon)', min: 2100, avg: 2250, max: 2400, minTrend: '-1.2%', avgTrend: '+2.1%', maxTrend: '+4.5%', positiveMin: false, positiveAvg: true, positiveMax: true },
    'wheat': { label: 'Wheat (Sharbati)', min: 2850, avg: 3002, max: 3120, minTrend: '-2.1%', avgTrend: '+1.4%', maxTrend: '+3.8%', positiveMin: false, positiveAvg: true, positiveMax: true },
    'soy': { label: 'Soybean', min: 4100, avg: 4350, max: 4500, minTrend: '+0.5%', avgTrend: '+1.1%', maxTrend: '+2.0%', positiveMin: true, positiveAvg: true, positiveMax: true },
    'cotton': { label: 'Cotton (Kapas)', min: 6500, avg: 6900, max: 7200, minTrend: '-1.1%', avgTrend: '-2.4%', maxTrend: '-3.0%', positiveMin: false, positiveAvg: false, positiveMax: false }
};

// ─── LOGIC ───────────────────────────────────────────────────────────
function deg2rad(deg: number) {
    return deg * (Math.PI / 180);
}

function getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number) {
    const R = 6371;
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

export function MarketplaceClient() {
    const [userLoc, setUserLoc] = useState<{ lat: number, lon: number } | null>(null);
    const [detectingLoc, setDetectingLoc] = useState(false);
    const [retailersList, setRetailersList] = useState<ProcessedRetailer[]>([]); // Array of processed retailers
    const [sortBy, setSortBy] = useState('netProfit'); // netProfit | distance | trustScore
    const [selectedRetailer, setSelectedRetailer] = useState<ProcessedRetailer | null>(null);
    const [leafletLoaded, setLeafletLoaded] = useState(false);
    const [selectedCrop, setSelectedCrop] = useState<string>('wheat');
    const activeCropData = CROP_MARKET_DATA[selectedCrop];

    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<any>(null);
    const userMarkerRef = useRef<any>(null);
    const retailerMarkersRef = useRef<any[]>([]);

    const { toast } = useToast();

    // Inject Leaflet library strictly without NPM to avoid environment crashes
    useEffect(() => {
        if (typeof window !== 'undefined') {
            // Check if Leaflet is already loaded
            if ((window as any).L) {
                setLeafletLoaded(true);
                return;
            }

            // Check if scripts are already being loaded
            if (document.getElementById('leaflet-css') || document.getElementById('leaflet-js')) {
                // Wait a bit and check again
                const checkInterval = setInterval(() => {
                    if ((window as any).L) {
                        clearInterval(checkInterval);
                        setLeafletLoaded(true);
                    }
                }, 100);

                return () => clearInterval(checkInterval);
            }

            const link = document.createElement('link');
            link.id = 'leaflet-css';
            link.rel = 'stylesheet';
            link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
            document.head.appendChild(link);

            const script = document.createElement('script');
            script.id = 'leaflet-js';
            script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
            script.onload = () => setLeafletLoaded(true);
            script.onerror = () => setLeafletLoaded(true); // Continue anyway if load fails
            document.head.appendChild(script);
        }

        // Load transformed retailers immediately
        calculateRetailersAndSort(null, 'netProfit', 'wheat');
    }, []);

    // Initialize Map Once
    useEffect(() => {
        if (leafletLoaded && mapContainerRef.current && !mapInstanceRef.current) {
            const L = (window as any).L;
            // Default to Maharashtra bounds
            mapInstanceRef.current = L.map(mapContainerRef.current).setView([19.75, 75.71], 6);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap contributors',
                maxZoom: 18,
            }).addTo(mapInstanceRef.current);

            renderMarkers(userLoc, transformRetailers());
        }
    }, [leafletLoaded]);

    // Re-render markers if map already exists
    useEffect(() => {
        if (mapInstanceRef.current && leafletLoaded) {
            renderMarkers(userLoc, transformRetailers());
        }
    }, [userLoc, leafletLoaded]);

    function renderMarkers(loc: { lat: number, lon: number } | null, retailers: ProcessedRetailer[]) {
        const L = (window as any).L;
        const map = mapInstanceRef.current;
        if (!map || !L) return;

        // Clear old markers
        if (userMarkerRef.current) map.removeLayer(userMarkerRef.current);
        retailerMarkersRef.current.forEach(m => map.removeLayer(m));
        retailerMarkersRef.current = [];

        // Add user marker
        if (loc) {
            const userIcon = L.icon({
                iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
                shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
                iconSize: [25, 41],
                iconAnchor: [12, 41],
                popupAnchor: [1, -34],
                shadowSize: [41, 41]
            });

            userMarkerRef.current = L.marker([loc.lat, loc.lon], { icon: userIcon }).addTo(map)
                .bindPopup('<b>You are here</b><br/>Farmer Location').openPopup();

            map.setView([loc.lat, loc.lon], 8);
        }

        // Add retailer markers
        retailers.forEach(r => {
            const marker = L.marker([r.lat, r.lon]).addTo(map)
                .bindPopup(`<b>${r.name}</b><br/>₹${r.offeredPrice}/quintal`);
            retailerMarkersRef.current.push(marker);

            // Basic click handler for markers
            marker.on('click', () => {
                const found = retailersList.find(rx => rx.id === r.id) || r;
                setSelectedRetailer(found);
            });
        });
    }

    const handleDetectLocation = () => {
        if (!navigator.geolocation) {
            toast({ title: 'Geolocation Not Supported', description: 'Your browser does not support geolocation.', variant: 'destructive' });
            return;
        }
        setDetectingLoc(true);
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const uLat = pos.coords.latitude;
                const uLon = pos.coords.longitude;
                setUserLoc({ lat: uLat, lon: uLon });
                calculateRetailersAndSort({ lat: uLat, lon: uLon }, sortBy, selectedCrop);
                setDetectingLoc(false);
            },
            (error) => {
                setDetectingLoc(false);
                toast({ title: 'Location Error', description: error.message || 'Could not fetch your location.', variant: 'destructive' });
            }
        );
    };

    const calculateRetailersAndSort = (loc: { lat: number, lon: number } | null, sortKey: string, cropKey: string) => {
        const cropData = CROP_MARKET_DATA[cropKey];

        // Always re-read from localStorage so retailer edits are reflected immediately
        const freshRetailers = transformRetailers();

        // Raw retailer data with full stock for crop-specific price lookup
        const rawRetailers = getAllRetailers();
        const rawMap = new Map(rawRetailers.map(r => [r.id, r]));

        // Possible stock item names for the selected crop
        const cropNames = CROP_KEY_TO_NAME[cropKey] ?? [];

        const processed = freshRetailers.map(r => {
            let dist = 0;
            let transCost = 0;

            if (loc) {
                dist = getDistanceFromLatLonInKm(loc.lat, loc.lon, r.lat, r.lon);
                transCost = dist * 8; // ₹8 per quintal per km (standard cargo rate)
            }

            // ── Look up THIS retailer's ACTUAL price for the selected crop ──
            const rawRetailer = rawMap.get(r.id);
            let finalPrice: number | null = null;  // null = no price set for this crop

            if (rawRetailer && rawRetailer.stock.length > 0 && cropNames.length > 0) {
                const stockItem = rawRetailer.stock.find(s =>
                    cropNames.some(name => s.name.toLowerCase() === name.toLowerCase())
                );
                if (stockItem && stockItem.pricePerKg > 0) {
                    finalPrice = stockItem.pricePerKg;
                }
            }

            // If retailer has no stock for this crop, use crop market average as display placeholder
            const displayPrice = finalPrice ?? cropData.avg;

            return {
                ...r,
                distance: dist,
                transportCost: transCost,
                offeredPrice: displayPrice,
                netProfit: displayPrice - transCost,
                hasRealPrice: finalPrice !== null,   // true = retailer actually set this price
                realPrice: finalPrice,                // the raw stock price (null if not set)
            };
        });

        // Sort: retailers WITH real stock price for this crop always appear first
        processed.sort((a: any, b: any) => {
            // Put retailers with no real price at the bottom regardless of sort key
            if (a.hasRealPrice && !b.hasRealPrice) return -1;
            if (!a.hasRealPrice && b.hasRealPrice) return 1;

            if (sortKey === 'netProfit') return b.netProfit! - a.netProfit!;
            if (sortKey === 'distance') return a.distance! - b.distance!;
            if (sortKey === 'trustScore') return b.trustScore - a.trustScore;
            return 0;
        });

        setRetailersList(processed);
    };


    // AI Recommendation — price + km equally weighted scoring
    // Best recommendation = highest real price AND closest distance (both matter equally)
    const getAIRecommendation = (retailers: ProcessedRetailer[], selectedCrop: string) => {
        if (retailers.length === 0) return null;

        try {
            const hasLocation = !!userLoc;

            // Only score retailers who have an ACTUAL price set for this crop.
            // Retailers with placeholder/average prices should not be recommended.
            const eligible = (retailers as any[]).filter(r => r.hasRealPrice !== false);
            const pool = eligible.length > 0 ? eligible : retailers; // fallback to all if none have real prices

            // ── Step 1: collect raw values ─────────────────────────────────────
            const prices = pool.map((r: any) => r.realPrice ?? r.offeredPrice ?? 0);
            const profits = pool.map((r: any) => r.netProfit ?? r.offeredPrice ?? 0);
            const ratings = pool.map((r: any) => r.trustScore ?? 0);
            // Real GPS distance: only meaningful when < 900 km (eliminates fallback values)
            const distances = pool.map((r: any) =>
                hasLocation && (r.distance ?? 9999) < 900 ? (r.distance as number) : null
            );

            const minPrice = Math.min(...prices);
            const maxPrice = Math.max(...prices);
            const minProfit = Math.min(...profits);
            const maxProfit = Math.max(...profits);
            const minRating = Math.min(...ratings);
            const maxRating = Math.max(...ratings);
            const validDists = distances.filter((d): d is number => d !== null);
            const minDist = validDists.length ? Math.min(...validDists) : 0;
            const maxDist = validDists.length ? Math.max(...validDists) : 1;

            const norm = (val: number, min: number, max: number) =>
                max === min ? 0.5 : (val - min) / (max - min);

            // ── Step 2: score each eligible retailer ───────────────────────────
            const scored = pool.map((r: any) => {

                // 85% — Net Profit (The absolute most important metric)
                // Net profit = Actual Price - Transport Cost (Distance * Rate)
                // This beautifully and natively handles both "Price" and "Km" in pure Rupees.
                // It ensures a farmer isn't recommended a nearby retailer who pays dirt-cheap prices.
                const profitScore = norm(r.netProfit ?? r.offeredPrice ?? 0, minProfit, maxProfit);

                // 10% — Trust / rating (payment reliability)
                const ratingScore = norm(r.trustScore ?? 0, minRating, maxRating);

                // 5%  — Verified badge small bonus
                const verifiedScore = r.isVerified ? 1 : 0;

                // Profit inherently dominates, resolving the "why low price is recommended" issue
                const compositeScore =
                    (profitScore * 0.85) +
                    (ratingScore * 0.10) +
                    (verifiedScore * 0.05);

                return { ...r, aiScore: compositeScore };
            });

            return scored.sort((a: any, b: any) => (b.aiScore ?? 0) - (a.aiScore ?? 0))[0] ?? null;

        } catch {
            // Fallback: pick whoever has highest net profit (real price - transport)
            return (retailers as any[]).reduce((best: any, r: any) =>
                (r.netProfit ?? r.offeredPrice ?? 0) > (best.netProfit ?? best.offeredPrice ?? 0) ? r : best,
                retailers[0]
            );
        }
    };

    const aiRecommendedRetailer = getAIRecommendation(retailersList, selectedCrop);



    // Re-sort effect
    useEffect(() => {
        if (retailersList.length > 0) {
            calculateRetailersAndSort(userLoc, sortBy, selectedCrop);
        }
    }, [sortBy, selectedCrop, userLoc]);


    return (
        <div className="space-y-6">
            <Tabs defaultValue="map" className="w-full">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                    <TabsList className="bg-muted p-1 rounded-lg">
                        <TabsTrigger value="map" className="rounded-md">Buyer Map</TabsTrigger>
                        <TabsTrigger value="market" className="rounded-md">Live Market & Buyers</TabsTrigger>
                    </TabsList>

                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">Selling Crop:</span>
                        <Select value={selectedCrop} onValueChange={setSelectedCrop}>
                            <SelectTrigger className="w-[180px] bg-background">
                                <SelectValue placeholder="Select Crop" />
                            </SelectTrigger>
                            <SelectContent>
                                {Object.entries(CROP_MARKET_DATA).map(([key, data]) => (
                                    <SelectItem key={key} value={key} className="font-medium">{data.label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <TabsContent value="map" className="mt-0 outline-none space-y-6">
                    <div className="flex flex-col md:flex-row items-center gap-4 bg-primary/10 p-4 rounded-xl border border-primary/20">
                        <MapPin className="h-8 w-8 text-primary shrink-0" />
                        <div className="flex-1">
                            <h2 className="font-headline font-bold text-lg text-primary">Discover Buyers & Retailers</h2>
                            <p className="text-sm text-muted-foreground">Detect your location to find the nearest and most profitable buyers for your crop using live OpenStreetMap tracking.</p>
                        </div>
                        <Button onClick={handleDetectLocation} disabled={detectingLoc} className="w-full md:w-auto">
                            {detectingLoc ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Navigation className="mr-2 h-4 w-4" />}
                            Detect My Location
                        </Button>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* LEFT COLUMN: Retailer List */}
                        <div className="lg:col-span-1 border rounded-xl bg-card overflow-hidden shadow-sm flex flex-col h-[700px]">
                            <div className="p-4 border-b bg-muted/30 flex justify-between items-center">
                                <h3 className="font-bold font-headline">Nearby Retailers</h3>
                                <Select value={sortBy} onValueChange={setSortBy}>
                                    <SelectTrigger className="w-[140px] text-xs h-8">
                                        <SelectValue placeholder="Sort by" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="netProfit">Highest Profit</SelectItem>
                                        <SelectItem value="distance">Shortest Distance</SelectItem>
                                        <SelectItem value="trustScore">Highest Rating</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                {retailersList.map((ret, index) => (
                                    <Card
                                        key={ret.id}
                                        className="cursor-pointer hover:border-primary/50 transition-colors shadow-sm"
                                        onClick={() => setSelectedRetailer(ret)}
                                    >
                                        <CardContent className="p-4">
                                            <div className="flex gap-3 mb-3">
                                                <img src={ret.image} alt={ret.name} className="w-12 h-12 rounded-lg object-cover bg-muted" />
                                                <div>
                                                    <h4 className="font-bold text-sm tracking-tight flex items-center gap-1 flex-wrap">
                                                        {ret.name}
                                                        {ret.isVerified && <ShieldCheck className="h-3.5 w-3.5 text-blue-500" />}
                                                        {aiRecommendedRetailer && ret.id === aiRecommendedRetailer.id && <Badge variant="default" className="bg-primary/20 text-primary border-primary/30 text-[10px] h-4 ml-1">AI Recommended</Badge>}
                                                    </h4>
                                                    <p className="text-xs text-muted-foreground flex gap-2 mt-0.5">
                                                        <span className="bg-primary/10 text-primary px-1.5 py-0.5 rounded text-[10px] uppercase font-bold tracking-widest">{ret.type || 'Wholesale Market'}</span>
                                                        <span className="flex items-center text-amber-600"><Star className="h-3 w-3 mr-1 fill-amber-500" />{ret.trustScore}</span>
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="space-y-2 text-xs">
                                                <div className="flex justify-between items-center bg-muted/40 px-2 py-1.5 rounded">
                                                    <span className="text-muted-foreground">Offered Price</span>
                                                    <span className="font-semibold">₹{ret.offeredPrice}/q</span>
                                                </div>
                                                <div className="flex justify-between items-center bg-muted/40 px-2 py-1.5 rounded">
                                                    <span className="text-muted-foreground flex items-center gap-1"><Truck className="h-3 w-3" /> Transport {userLoc && ret.distance ? `(${ret.distance.toFixed(0)}km)` : ''}</span>
                                                    <span className="text-destructive font-medium">{userLoc && ret.transportCost ? `-₹${ret.transportCost.toFixed(0)}/q` : 'N/A'}</span>
                                                </div>
                                                <div className="flex justify-between items-center bg-green-50 text-green-800 px-2 py-1.5 rounded border border-green-100 font-bold">
                                                    <span className="flex items-center gap-1"><TrendingUp className="h-3 w-3" /> Net Profit</span>
                                                    <span className="text-sm">₹{userLoc && ret.netProfit ? ret.netProfit.toFixed(0) : ret.offeredPrice}/q</span>
                                                </div>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="w-full mt-2"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        const url = userLoc
                                                            ? `https://www.google.com/maps/dir/?api=1&origin=${userLoc.lat},${userLoc.lon}&destination=${ret.lat},${ret.lon}`
                                                            : `https://www.google.com/maps/dir/?api=1&destination=${ret.lat},${ret.lon}`;
                                                        window.open(url, '_blank');
                                                    }}
                                                >
                                                    <Navigation className="h-3 w-3 mr-2" /> Get Directions
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>

                        {/* RIGHT COLUMN: Leaflet Map */}
                        <div className="lg:col-span-2 border rounded-xl overflow-hidden shadow-sm h-[700px] relative z-0">
                            <div ref={mapContainerRef} className="absolute inset-0 z-0 border-0 outline-none"></div>
                            {!leafletLoaded && (
                                <div className="absolute inset-0 bg-background/80 flex items-center justify-center z-10 backdrop-blur-sm">
                                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                </div>
                            )}
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="market" className="mt-0 outline-none space-y-6">
                    {/* Market Stats Row */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Card className="border shadow-sm">
                            <CardContent className="p-5">
                                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Min Price Today</p>
                                <div className="flex items-baseline gap-1">
                                    <h3 className="text-3xl font-black font-headline tracking-tighter">₹{activeCropData.min}</h3>
                                    <span className="text-sm text-muted-foreground tracking-tight">/quintal</span>
                                </div>
                                <div className={`flex items-center gap-1 mt-2 text-sm font-medium ${activeCropData.positiveMin ? 'text-emerald-600' : 'text-rose-600'}`}>
                                    {activeCropData.positiveMin ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                                    <span>{activeCropData.minTrend} from yesterday</span>
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="border shadow-sm">
                            <CardContent className="p-5">
                                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Avg Market Price</p>
                                <div className="flex items-baseline gap-1">
                                    <h3 className="text-3xl font-black font-headline tracking-tighter">₹{activeCropData.avg}</h3>
                                    <span className="text-sm text-muted-foreground tracking-tight">/quintal</span>
                                </div>
                                <div className={`flex items-center gap-1 mt-2 text-sm font-medium ${activeCropData.positiveAvg ? 'text-emerald-600' : 'text-rose-600'}`}>
                                    {activeCropData.positiveAvg ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                                    <span>{activeCropData.avgTrend} from yesterday</span>
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="border shadow-sm">
                            <CardContent className="p-5">
                                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Max Price Today</p>
                                <div className="flex items-baseline gap-1">
                                    <h3 className="text-3xl font-black font-headline tracking-tighter">₹{activeCropData.max}</h3>
                                    <span className="text-sm text-muted-foreground tracking-tight">/quintal</span>
                                </div>
                                <div className={`flex items-center gap-1 mt-2 text-sm font-medium ${activeCropData.positiveMax ? 'text-emerald-600' : 'text-rose-600'}`}>
                                    {activeCropData.positiveMax ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                                    <span>{activeCropData.maxTrend} from yesterday</span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* AI Recommendation Section */}
                    {aiRecommendedRetailer && (
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-5">
                            <div className="flex items-start gap-4">
                                <div className="bg-primary p-3 rounded-lg flex-shrink-0">
                                    <Brain className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                    <h3 className="font-bold font-headline text-lg text-primary flex items-center gap-2">
                                        AI Recommendation
                                        <Badge variant="secondary" className="bg-blue-100 text-blue-800">Best Deal</Badge>
                                    </h3>
                                    <p className="text-muted-foreground mt-1">
                                        Based on price, distance, ratings, and verification status,
                                        <span className="font-semibold text-foreground"> {aiRecommendedRetailer.name}</span> offers the best value for your {selectedCrop}.
                                    </p>
                                    <div className="mt-3 flex flex-wrap gap-4 pt-2 border-t">
                                        <div className="flex items-center gap-2">
                                            <TrendingUp className="h-4 w-4 text-green-600" />
                                            <span className="text-sm">
                                                Best Net Profit: <span className="font-bold">₹{userLoc && aiRecommendedRetailer.netProfit ? aiRecommendedRetailer.netProfit.toFixed(0) : aiRecommendedRetailer.offeredPrice}/q</span>
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <MapPin className="h-4 w-4 text-blue-600" />
                                            <span className="text-sm">
                                                Distance: <span className="font-bold">{userLoc && aiRecommendedRetailer.distance ? `${aiRecommendedRetailer.distance.toFixed(1)} km` : 'N/A'}</span>
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                                            <span className="text-sm">
                                                Rating: <span className="font-bold">{aiRecommendedRetailer.trustScore}/5</span>
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Buyer List Table */}
                    <Card className="border shadow-sm overflow-hidden">
                        <div className="p-5 border-b bg-muted/20 flex justify-between items-center">
                            <div>
                                <h3 className="font-bold font-headline text-lg">Buyer Comparison</h3>
                                <p className="text-sm text-muted-foreground">Compare live offers from verified buyers in your area</p>
                            </div>
                            <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">{retailersList.length} Active Buyers</Badge>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-muted-foreground uppercase bg-muted/40 font-bold tracking-wider">
                                    <tr>
                                        <th className="px-5 py-4 font-bold">Buyer Name</th>
                                        <th className="px-5 py-4 font-bold">Type</th>
                                        <th className="px-5 py-4 font-bold">Offered Price</th>
                                        <th className="px-5 py-4 font-bold">Distance</th>
                                        <th className="px-5 py-4 font-bold text-right">Net Profit</th>
                                        <th className="px-5 py-4 font-bold text-center">Rating</th>
                                        <th className="px-5 py-4 font-bold"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {retailersList.map((ret) => (
                                        <tr key={ret.id} className="hover:bg-muted/20 transition-colors">
                                            <td className="px-5 py-4 font-semibold flex items-center gap-2 whitespace-nowrap">
                                                {ret.isVerified ? <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0" /> : <ShieldCheck className="h-4 w-4 text-muted shrink-0" />}
                                                {ret.name}
                                            </td>
                                            <td className="px-5 py-4 whitespace-nowrap text-muted-foreground">
                                                <Badge variant="outline" className="font-medium bg-background">{(ret.type || '').includes('Whole') ? 'Wholesale' : 'Export'}</Badge>
                                            </td>
                                            <td className="px-5 py-4 font-bold whitespace-nowrap">
                                                ₹{ret.offeredPrice}/q
                                            </td>
                                            <td className="px-5 py-4 text-muted-foreground whitespace-nowrap">
                                                {userLoc && ret.distance && ret.transportCost ? `${ret.distance.toFixed(0)} km (-₹${ret.transportCost.toFixed(0)})` : '-'}
                                            </td>
                                            <td className="px-5 py-4 text-right whitespace-nowrap">
                                                <span className="font-bold text-emerald-700 text-base">₹{userLoc && ret.netProfit ? ret.netProfit.toFixed(0) : ret.offeredPrice}</span>
                                            </td>
                                            <td className="px-5 py-4 text-center whitespace-nowrap">
                                                <span className="flex items-center justify-center font-bold text-amber-600 gap-1">
                                                    <Star className="h-3.5 w-3.5 fill-amber-500" />
                                                    {ret.trustScore}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4 text-right whitespace-nowrap">
                                                <Button size="sm" variant="outline" onClick={() => setSelectedRetailer(ret)}>
                                                    View Details
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </TabsContent>
            </Tabs>
            <Dialog open={!!selectedRetailer} onOpenChange={(open) => !open && setSelectedRetailer(null)}>
                <DialogContent className="sm:max-w-md z-50">
                    {selectedRetailer && (
                        <>
                            <DialogHeader>
                                <div className="flex items-start gap-4 mb-2">
                                    <img src={selectedRetailer.image} alt={selectedRetailer.name} className="w-16 h-16 rounded-lg object-cover shadow-sm bg-muted" />
                                    <div>
                                        <DialogTitle className="flex items-center gap-2">
                                            {selectedRetailer.name}
                                            {selectedRetailer.isVerified && <ShieldCheck className="h-4 w-4 text-blue-500" />}
                                        </DialogTitle>
                                        <div className="mt-1 flex items-center gap-2">
                                            <DialogDescription className="sr-only">
                                                Retailer ({selectedRetailer.type}) with a trust score of {selectedRetailer.trustScore}.
                                            </DialogDescription>
                                            <Badge variant="outline">{selectedRetailer.type}</Badge>
                                            <span className="flex items-center text-amber-600 text-sm font-medium"><Star className="h-3.5 w-3.5 mr-1 fill-amber-500" />{selectedRetailer.trustScore}</span>
                                        </div>
                                    </div>
                                </div>
                            </DialogHeader>

                            <div className="space-y-4 py-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-muted/40 p-3 rounded-xl border relative overflow-hidden">
                                        <div className="absolute top-0 left-0 w-1 h-full bg-primary/50"></div>
                                        <p className="text-xs text-muted-foreground mb-1">Offered Price</p>
                                        <p className="font-headline font-bold text-lg">₹{selectedRetailer.offeredPrice}<span className="text-xs font-normal text-muted-foreground">/q</span></p>
                                    </div>
                                    <div className="bg-green-50 p-3 rounded-xl border border-green-100 relative overflow-hidden">
                                        <div className="absolute top-0 left-0 w-1 h-full bg-green-500"></div>
                                        <p className="text-xs text-green-800/70 mb-1">Est. Net Profit</p>
                                        <p className="font-headline font-bold text-lg text-green-700">₹{userLoc && selectedRetailer.netProfit ? selectedRetailer.netProfit.toFixed(0) : selectedRetailer.offeredPrice}<span className="text-xs font-normal opacity-70">/q</span></p>
                                    </div>
                                </div>

                                <div className="bg-muted p-3 rounded-xl space-y-3 mt-4 text-sm">
                                    <div className="flex items-start gap-3">
                                        <MapPin className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                                        <p className="text-muted-foreground">{selectedRetailer.address}</p>
                                    </div>
                                    <div className="w-full h-32 mt-2 rounded-lg overflow-hidden border">
                                        {selectedRetailer.id && (
                                            <iframe
                                                width="100%"
                                                height="100%"
                                                frameBorder="0"
                                                scrolling="no"
                                                src={getAllRetailers().find((r: any) => r.id === selectedRetailer.id)?.iframeLink || `https://www.openstreetmap.org/export/embed.html?bbox=${selectedRetailer.lon - 0.01},${selectedRetailer.lat - 0.01},${selectedRetailer.lon + 0.01},${selectedRetailer.lat + 0.01}&layer=mapnik&marker=${selectedRetailer.lat},${selectedRetailer.lon}`}
                                            ></iframe>
                                        )}
                                    </div>
                                    <div className="flex items-start gap-3 mt-3">
                                        <Truck className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                                        <p className="text-muted-foreground">
                                            {userLoc && selectedRetailer.distance && selectedRetailer.transportCost ? `${selectedRetailer.distance.toFixed(1)} km away (Est. ₹${selectedRetailer.transportCost.toFixed(0)}/quintal transport)` : 'Distance unknown (Locate me to calculate)'}
                                        </p>
                                    </div>
                                    <div className="flex justify-between items-center border-t pt-3 mt-3">
                                        <div className="flex items-center gap-2">
                                            <Info className="h-4 w-4 text-muted-foreground" />
                                            <span className="text-xs text-muted-foreground">Payment: {selectedRetailer.paymentTerms}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-3 pt-2">
                                <Button className="w-full bg-[#16a34a] hover:bg-green-700" onClick={() => window.open(`tel:${selectedRetailer.phone}`)}>
                                    <Phone className="mr-2 h-4 w-4" /> Call Buyer
                                </Button>
                                <Button variant="outline" className="w-full" onClick={() => {
                                    toast({ title: "Opening Messages", description: `Starting conversation with ${selectedRetailer.name}` });
                                }}>
                                    Send Message
                                </Button>
                            </div>
                            <Button
                                variant="secondary"
                                className="w-full mt-2 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200"
                                onClick={() => {
                                    const retailer = getAllRetailers().find((r: any) => r.id === selectedRetailer.id);
                                    if (retailer?.mapsLink) {
                                        window.open(retailer.mapsLink, '_blank');
                                    } else {
                                        const url = userLoc
                                            ? `https://www.google.com/maps/dir/?api=1&origin=${userLoc.lat},${userLoc.lon}&destination=${selectedRetailer.lat},${selectedRetailer.lon}`
                                            : `https://www.google.com/maps/dir/?api=1&destination=${selectedRetailer.lat},${selectedRetailer.lon}`;
                                        window.open(url, '_blank');
                                    }
                                }}
                            >
                                <Navigation className="mr-2 h-4 w-4" /> Get Directions
                            </Button>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
