"use client";

import { useState, useEffect } from "react";
import { Carrot, Star, MapPin, Phone, ShoppingCart } from "lucide-react";
import { getAllRetailersAsync } from "./data-service";
import Link from "next/link";

// Define the retailer type locally since it's used in the component
type Retailer = {
    id: string;
    name: string;
    image: string;
    location: string;
    mapsLink: string;
    iframeLink: string;
    rating: number;
    reviewsCount: number;
    contact: string;
    verified: boolean;
    stock: Array<{
        id: string;
        name: string;
        pricePerKg: number;
        quantity: string;
    }>;
};

export default function RetailerMarketplace() {
    const [searchQuery, setSearchQuery] = useState("");
    const [retailers, setRetailers] = useState<Retailer[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadRetailers = async () => {
            try {
                const allRetailers = await getAllRetailersAsync();
                setRetailers(allRetailers);
            } catch (error) {
                console.error('Error loading retailers:', error);
                // Fallback to empty array
                setRetailers([]);
            } finally {
                setLoading(false);
            }
        };

        loadRetailers();
    }, []);

    const filteredRetailers = retailers.filter(retailer =>
        retailer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        retailer.location.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 text-gray-900 font-sans pb-16 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <p className="mt-4 text-lg font-medium text-gray-700">Loading retailers...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background text-foreground font-sans pb-16">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-20">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary shadow-inner">
                                <Carrot className="w-6 h-6" />
                            </div>
                            <h1 className="text-xl font-bold text-primary">
                                Retailer Marketplace
                            </h1>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
                {/* Search Bar */}
                <div className="mb-8 relative">
                    <input
                        type="text"
                        placeholder="Search retailers by name or location..."
                        className="w-full bg-card border-2 border-border rounded-2xl py-4 pl-14 pr-6 text-lg text-card-foreground focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/20 transition-all shadow-sm"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <div className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground">
                        <ShoppingCart className="w-6 h-6" />
                    </div>
                </div>

                {/* Retailers Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredRetailers.map((retailer) => (
                        <Link
                            href={`/retailer/dashboard/${retailer.id}`}
                            key={retailer.id}
                            className="block group"
                        >
                            <div className="bg-card rounded-3xl overflow-hidden shadow-lg border border-border hover:shadow-xl hover:border-primary/30 transition-all duration-300 hover:-translate-y-1">
                                <div className="h-48 relative">
                                    <img
                                        src={retailer.image}
                                        alt={retailer.name}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            const target = e.target as HTMLImageElement;
                                            target.onerror = null;
                                            target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 24 24'%3E%3Crect width='100%25' height='100%25' fill='%23e5e7eb'/%3E%3Ccircle cx='12' cy='12' r='3' fill='%239ca3af'/%3E%3C/svg%3E";
                                        }}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />

                                    <div className="absolute bottom-6 left-6 right-6">
                                        <h2 className="text-xl font-extrabold text-white mb-2 drop-shadow-lg group-hover:underline">
                                            {retailer.name}
                                        </h2>
                                        <div className="flex items-center gap-3">
                                            <span className="bg-yellow-500 text-white px-2.5 py-1 rounded-md text-sm font-bold flex items-center gap-1 shadow-md">
                                                <Star className="w-4 h-4 fill-white" /> {retailer.rating}
                                            </span>
                                            <span className="text-white text-sm font-medium drop-shadow-md">
                                                ({retailer.reviewsCount} reviews)
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-6">
                                    <div className="flex items-start gap-4 mb-4 p-4 rounded-2xl bg-muted/50 border border-border group-hover:border-primary/20 transition-colors">
                                        <div className="p-2 bg-background rounded-lg shadow-sm group-hover:bg-primary/5 transition-colors">
                                            <MapPin className="w-5 h-5 text-red-500" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-card-foreground text-sm">Location</h3>
                                            <p className="text-muted-foreground mt-1 text-sm">{retailer.location}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-4 mb-6 p-4 rounded-2xl bg-muted/50 border border-border group-hover:border-primary/20 transition-colors">
                                        <div className="p-2 bg-background rounded-lg shadow-sm group-hover:bg-primary/5 transition-colors">
                                            <Phone className="w-5 h-5 text-blue-500" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-card-foreground text-sm">Contact</h3>
                                            <p className="text-muted-foreground mt-1 text-sm">{retailer.contact}</p>
                                        </div>
                                    </div>

                                    <div className="flex justify-between items-center">
                                        <div className="text-sm font-medium text-muted-foreground">
                                            {retailer.stock.length} items in stock
                                        </div>
                                        <div className="bg-primary hover:bg-primary/90 text-primary-foreground px-5 py-2.5 rounded-full font-bold shadow-md shadow-primary/20 transition-all flex items-center gap-2 group-hover:gap-3">
                                            View Store <ShoppingCart className="w-4 h-4" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>

                {filteredRetailers.length === 0 && !loading && (
                    <div className="text-center py-16">
                        <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
                            <ShoppingCart className="w-12 h-12 text-muted-foreground" />
                        </div>
                        <h3 className="text-xl font-bold text-card-foreground mb-2">No retailers found</h3>
                        <p className="text-muted-foreground max-w-md mx-auto">
                            We couldn't find any retailers matching "{searchQuery}". Try adjusting your search.
                        </p>
                    </div>
                )}
            </main>
        </div>
    );
}