'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../ui/dialog';
import { useRouter } from 'next/navigation';
import { ShoppingBag, ArrowRight, Tag, ChevronLeft, ChevronRight, Search, PlusCircle, Leaf } from 'lucide-react';
import Image from 'next/image';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useToast } from '@/hooks/use-toast';

const CAROUSEL_BANNERS = [
    { id: 1, image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=1200', title: 'Farm Fresh Deliveries', subtitle: 'Directly from local fields to your home' },
    { id: 2, image: 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?auto=format&fit=crop&q=80&w=1200', title: 'Organic Produce', subtitle: 'Pesticide-free vegetables at best prices' },
    { id: 3, image: 'https://images.unsplash.com/photo-1533900298318-6b8da08a523e?auto=format&fit=crop&q=80&w=1200', title: 'Wholesale Savings', subtitle: 'Compare farmer deals & save money' }
];

type Product = {
    id: string;
    name: string;
    category: string;
    image: string;
    startingPrice: number;
    isUserListing?: boolean;
};

export const MOCK_PRODUCTS: Product[] = [
    {
        id: 'potato-jalgaon',
        name: 'Fresh Potatoes (Jalgaon Variety)',
        category: 'Vegetables',
        image: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&q=80&w=400',
        startingPrice: 18,
    },
    {
        id: 'red-onion-jalgaon',
        name: 'Premium Red Onions (Jalgaon)',
        category: 'Vegetables',
        image: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?auto=format&fit=crop&q=80&w=400',
        startingPrice: 22,
    },
    {
        id: 'wheat-sharbati',
        name: 'Sharbati Wheat (Jalgaon Farms)',
        category: 'Grains',
        image: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&q=80&w=400',
        startingPrice: 28,
    },
    {
        id: 'peas-green',
        name: 'Organic Green Peas',
        category: 'Vegetables',
        image: '/peas.jpg',
        startingPrice: 60,
    },
    {
        id: 'tomato-desi',
        name: 'Desi Tomatoes (Pesticide Free)',
        category: 'Vegetables',
        image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&q=80&w=400',
        startingPrice: 31,
    },
    {
        id: 'banana-jalgaon',
        name: 'Jalgaon Grand Naine Bananas',
        category: 'Fruits',
        image: 'https://images.unsplash.com/photo-1603833665858-e61d17a86224?auto=format&fit=crop&q=80&w=400',
        startingPrice: 15,
    },
    {
        id: 'rice-basmati',
        name: 'Premium Basmati Rice',
        category: 'Grains',
        image: '/basmati.jpg',
        startingPrice: 85,
    },
    {
        id: 'apple-kashmir',
        name: 'Kashmiri Apples',
        category: 'Fruits',
        image: 'https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?auto=format&fit=crop&q=80&w=400',
        startingPrice: 120,
    },
    {
        id: 'garlic-local',
        name: 'Organic Garlic',
        category: 'Vegetables',
        image: 'https://images.unsplash.com/photo-1622206151226-18ca2c9ab4a1?auto=format&fit=crop&q=80&w=400',
        startingPrice: 150,
    },
    {
        id: 'lentils-toor',
        name: 'Toor Dal (Unpolished)',
        category: 'Staples',
        image: 'https://images.unsplash.com/photo-1515543904379-3d757afe72e4?auto=format&fit=crop&q=80&w=400',
        startingPrice: 140,
    },
    {
        id: 'mango-alphonso',
        name: 'Ratnagiri Alphonso Mango',
        category: 'Fruits',
        image: 'https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&q=80&w=400',
        startingPrice: 400,
    },
    {
        id: 'spinach-fresh',
        name: 'Fresh Spinach (Palak)',
        category: 'Vegetables',
        image: '/spinach.jpg',
        startingPrice: 40,
    },
];

const CATEGORY_IMAGES: Record<string, string> = {
    Vegetables: 'https://images.unsplash.com/photo-1597362925123-77861d3fbac7?auto=format&fit=crop&q=80&w=400',
    Fruits: 'https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&q=80&w=400',
    Grains: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&q=80&w=400',
    Staples: 'https://images.unsplash.com/photo-1515543904379-3d757afe72e4?auto=format&fit=crop&q=80&w=400',
    Other: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=400',
};

export function CustomerMarketplaceClient() {
    const router = useRouter();
    const { toast } = useToast();
    const [filter, setFilter] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [currentBanner, setCurrentBanner] = useState(0);
    const [showListingForm, setShowListingForm] = useState(false);
    const [userListings, setUserListings] = useState<Product[]>([]);

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        category: 'Vegetables',
        pricePerKg: '',
        quantity: '',
        location: '',
        farmerName: '',
        phone: '',
        imageUrl: '',
        description: '',
    });
    const [formLoading, setFormLoading] = useState(false);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentBanner((prev) => (prev + 1) % CAROUSEL_BANNERS.length);
        }, 5000);
        return () => clearInterval(timer);
    }, []);

    // Load saved user listings from localStorage on mount
    useEffect(() => {
        const saved = localStorage.getItem('user_listings');
        if (saved) setUserListings(JSON.parse(saved));
    }, []);

    const nextBanner = () => setCurrentBanner((prev) => (prev + 1) % CAROUSEL_BANNERS.length);
    const prevBanner = () => setCurrentBanner((prev) => (prev - 1 + CAROUSEL_BANNERS.length) % CAROUSEL_BANNERS.length);

    const allProducts = useMemo(() => [...MOCK_PRODUCTS, ...userListings], [userListings]);

    const filteredProducts = useMemo(() => {
        return allProducts.filter(p => {
            const matchesCategory = filter === 'All' || p.category === filter;
            const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesCategory && matchesSearch;
        });
    }, [filter, searchQuery, allProducts]);

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name || !formData.pricePerKg) {
            toast({ variant: 'destructive', title: 'Missing fields', description: 'Please fill in at least the produce name and price.' });
            return;
        }
        setFormLoading(true);

        setTimeout(() => {
            const newListing: Product = {
                id: `user-listing-${Date.now()}`,
                name: formData.name,
                category: formData.category,
                image: formData.imageUrl || CATEGORY_IMAGES[formData.category] || CATEGORY_IMAGES.Other,
                startingPrice: parseFloat(formData.pricePerKg) || 0,
                isUserListing: true,
            };

            const updatedListings = [...userListings, newListing];
            setUserListings(updatedListings);
            localStorage.setItem('user_listings', JSON.stringify(updatedListings));

            // Also save extra detail for product detail page
            const listingDetails = JSON.parse(localStorage.getItem('user_listing_details') || '{}');
            listingDetails[newListing.id] = {
                ...formData,
                startingPrice: newListing.startingPrice,
            };
            localStorage.setItem('user_listing_details', JSON.stringify(listingDetails));

            setFormLoading(false);
            setShowListingForm(false);
            setFormData({ name: '', category: 'Vegetables', pricePerKg: '', quantity: '', location: '', farmerName: '', phone: '', imageUrl: '', description: '' });

            toast({
                title: '🌿 Listing Added Successfully!',
                description: `"${newListing.name}" is now live in the marketplace at ₹${newListing.startingPrice}/kg.`,
            });
        }, 800);
    };

    return (
        <div className="space-y-6">

            {/* Moving Banner Carousel */}
            <div className="relative w-full h-48 md:h-64 lg:h-[400px] rounded-2xl overflow-hidden shadow-lg group mb-4">
                {CAROUSEL_BANNERS.map((banner, idx) => (
                    <div
                        key={banner.id}
                        className={`absolute inset-0 transition-opacity duration-1000 ${idx === currentBanner ? 'opacity-100 z-10' : 'opacity-0 z-0'
                            }`}
                    >
                        <Image
                            src={banner.image}
                            alt={banner.title}
                            fill
                            className="object-cover"
                            priority={idx === 0}
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent flex flex-col justify-center px-8 md:px-16">
                            <Badge className="bg-emerald-500/90 text-white w-fit mb-4 border-none backdrop-blur-sm px-3 py-1">Super Saver Deals!</Badge>
                            <h2 className="text-white text-3xl md:text-5xl lg:text-6xl font-headline font-bold mb-2 md:mb-4 tracking-tight drop-shadow-md max-w-2xl">
                                {banner.title}
                            </h2>
                            <p className="text-white/90 text-lg md:text-xl lg:text-2xl font-medium drop-shadow max-w-xl">
                                {banner.subtitle}
                            </p>
                        </div>
                    </div>
                ))}

                {/* Carousel Navigation Arrows */}
                <button
                    onClick={prevBanner}
                    className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-black/30 hover:bg-black/50 text-white p-2 md:p-3 rounded-full backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity"
                >
                    <ChevronLeft className="h-6 w-6" />
                </button>
                <button
                    onClick={nextBanner}
                    className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-black/30 hover:bg-black/50 text-white p-2 md:p-3 rounded-full backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity"
                >
                    <ChevronRight className="h-6 w-6" />
                </button>

                {/* Carousel Indicators */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
                    {CAROUSEL_BANNERS.map((_, idx) => (
                        <button
                            key={idx}
                            onClick={() => setCurrentBanner(idx)}
                            className={`w-2.5 h-2.5 rounded-full transition-all ${idx === currentBanner ? 'bg-emerald-500 w-8' : 'bg-white/50 hover:bg-white/80'
                                }`}
                        />
                    ))}
                </div>
            </div>

            {/* Search & Category Toggles */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between pb-2">
                <div className="flex gap-2 overflow-x-auto scrollbar-hide py-1 w-full md:w-auto">
                    {['All', 'Vegetables', 'Fruits', 'Grains', 'Staples'].map((cat) => (
                        <Button
                            key={cat}
                            variant={filter === cat ? 'default' : 'outline'}
                            className="rounded-full shadow-sm whitespace-nowrap"
                            onClick={() => setFilter(cat)}
                        >
                            {cat}
                        </Button>
                    ))}
                </div>

                <div className="relative w-full md:w-64 shrink-0">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search products..."
                        className="pl-9 rounded-full bg-background border-primary/20 focus-visible:ring-primary/30"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {/* Product Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProducts.map((product: Product) => (
                    <div
                        key={product.id}
                        onClick={() => router.push(`/customer-marketplace/${product.id}`)}
                        className="block cursor-pointer"
                    >
                        <Card className="overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group cursor-pointer border-transparent bg-card group-hover:border-primary/20 h-full flex flex-col">
                            <div className="relative h-48 w-full bg-muted overflow-hidden">
                                <Image
                                    src={product.image}
                                    alt={product.name}
                                    fill
                                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                                    loading="lazy"
                                    quality={75}
                                />
                                <div className="absolute top-2 left-2 flex gap-1">
                                    <Badge className="bg-white/90 text-primary hover:bg-white border-none shadow-sm backdrop-blur-sm">
                                        {product.category}
                                    </Badge>
                                    {product.isUserListing && (
                                        <Badge className="bg-emerald-500/90 text-white border-none shadow-sm backdrop-blur-sm text-[10px]">
                                            New Listing
                                        </Badge>
                                    )}
                                </div>
                            </div>
                            <CardContent className="p-4 flex flex-col flex-1">
                                <h3 className="font-headline font-bold text-lg mb-1 group-hover:text-primary transition-colors line-clamp-2">
                                    {product.name}
                                </h3>

                                <div className="mt-auto space-y-4">
                                    <div className="bg-primary/5 p-3 rounded-lg flex items-center gap-2 mt-4">
                                        <Tag className="h-4 w-4 text-primary shrink-0" />
                                        <div>
                                            <p className="text-[10px] uppercase font-bold text-primary tracking-wider">Prices Starting From</p>
                                            <p className="font-bold text-lg leading-tight mt-0.5 text-foreground">₹{product.startingPrice} <span className="text-muted-foreground text-xs font-normal">/kg</span></p>
                                        </div>
                                    </div>

                                    <Button className="w-full bg-emerald-600 hover:bg-emerald-700 shadow-md" onClick={(e) => { e.stopPropagation(); router.push(`/customer-marketplace/${product.id}`); }}>
                                        <ShoppingBag className="mr-2 h-4 w-4" /> Buy Now
                                        <ArrowRight className="ml-auto h-4 w-4 opacity-50 group-hover:translate-x-1 transition-transform" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                ))}
            </div>

            {/* ── List Your Produce Button ─────────────────────────────────── */}
            <div className="mt-10 pt-8 border-t border-dashed border-primary/20">
                <div className="flex flex-col items-center text-center gap-4">
                    <div className="bg-emerald-50 border border-emerald-200 rounded-2xl px-6 py-5 max-w-xl w-full">
                        <Leaf className="h-8 w-8 text-emerald-600 mx-auto mb-2" />
                        <h3 className="font-headline font-bold text-lg text-emerald-800">Are you a Farmer or Seller?</h3>
                        <p className="text-sm text-emerald-700/80 mt-1 mb-4">List your fresh produce directly in the marketplace. Buyers can see your price, quantity, and contact you directly.</p>
                        <Button
                            className="bg-emerald-600 hover:bg-emerald-700 font-bold shadow-md shadow-emerald-600/20 px-8"
                            onClick={() => setShowListingForm(true)}
                        >
                            <PlusCircle className="mr-2 h-5 w-5" />
                            List Your Produce
                        </Button>
                    </div>
                </div>
            </div>

            {/* ── List Your Produce Form Modal ─────────────────────────────── */}
            <Dialog open={showListingForm} onOpenChange={setShowListingForm}>
                <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-headline flex items-center gap-2">
                            <Leaf className="h-5 w-5 text-emerald-600" />
                            List Your Produce
                        </DialogTitle>
                        <DialogDescription>
                            Fill in your crop details. Your listing will appear live in the marketplace immediately after submission.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleFormSubmit} className="space-y-4 py-2">

                        {/* Produce Name */}
                        <div className="space-y-1.5">
                            <Label htmlFor="produce-name" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                Produce Name <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="produce-name"
                                placeholder="e.g. Fresh Tomatoes, Alphonso Mango..."
                                value={formData.name}
                                onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))}
                                required
                            />
                        </div>

                        {/* Category */}
                        <div className="space-y-1.5">
                            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Category</Label>
                            <Select value={formData.category} onValueChange={(v) => setFormData(p => ({ ...p, category: v }))}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                                <SelectContent>
                                    {['Vegetables', 'Fruits', 'Grains', 'Staples', 'Other'].map(c => (
                                        <SelectItem key={c} value={c}>{c}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Price & Quantity */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label htmlFor="price-kg" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                    Price / kg (₹) <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="price-kg"
                                    type="number"
                                    min="1"
                                    placeholder="e.g. 35"
                                    value={formData.pricePerKg}
                                    onChange={(e) => setFormData(p => ({ ...p, pricePerKg: e.target.value }))}
                                    required
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="quantity" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                    Available Qty (kg)
                                </Label>
                                <Input
                                    id="quantity"
                                    type="number"
                                    min="1"
                                    placeholder="e.g. 500"
                                    value={formData.quantity}
                                    onChange={(e) => setFormData(p => ({ ...p, quantity: e.target.value }))}
                                />
                            </div>
                        </div>

                        {/* Farmer Name & Location */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label htmlFor="farmer-name" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Your Name</Label>
                                <Input
                                    id="farmer-name"
                                    placeholder="e.g. Ramesh Patil"
                                    value={formData.farmerName}
                                    onChange={(e) => setFormData(p => ({ ...p, farmerName: e.target.value }))}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="location" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Location / Village</Label>
                                <Input
                                    id="location"
                                    placeholder="e.g. Nashik, Maharashtra"
                                    value={formData.location}
                                    onChange={(e) => setFormData(p => ({ ...p, location: e.target.value }))}
                                />
                            </div>
                        </div>

                        {/* Phone */}
                        <div className="space-y-1.5">
                            <Label htmlFor="phone" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Contact Number</Label>
                            <Input
                                id="phone"
                                type="tel"
                                placeholder="e.g. 9876543210"
                                value={formData.phone}
                                onChange={(e) => setFormData(p => ({ ...p, phone: e.target.value }))}
                            />
                        </div>

                        {/* Image URL (optional) */}
                        <div className="space-y-1.5">
                            <Label htmlFor="image-url" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                Image URL <span className="text-muted-foreground/60 font-normal normal-case">(optional — leave blank for auto)</span>
                            </Label>
                            <Input
                                id="image-url"
                                placeholder="https://example.com/my-tomatoes.jpg"
                                value={formData.imageUrl}
                                onChange={(e) => setFormData(p => ({ ...p, imageUrl: e.target.value }))}
                            />
                        </div>

                        {/* Description */}
                        <div className="space-y-1.5">
                            <Label htmlFor="description" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Description (optional)</Label>
                            <textarea
                                id="description"
                                className="w-full flex min-h-[80px] rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
                                placeholder="Describe your produce — variety, quality, harvest date..."
                                value={formData.description}
                                onChange={(e) => setFormData(p => ({ ...p, description: e.target.value }))}
                            />
                        </div>

                        <DialogFooter className="pt-2 gap-2">
                            <Button type="button" variant="outline" onClick={() => setShowListingForm(false)}>Cancel</Button>
                            <Button
                                type="submit"
                                className="bg-emerald-600 hover:bg-emerald-700 font-bold px-8"
                                disabled={formLoading}
                            >
                                {formLoading ? 'Listing...' : '🌿 Publish Listing'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
