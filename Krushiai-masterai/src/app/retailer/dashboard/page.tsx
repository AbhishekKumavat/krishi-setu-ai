"use client";

import { Star, MapPin, Phone, Carrot, ShoppingBasket, ExternalLink, ShieldCheck } from "lucide-react";
import Link from "next/link";
import KrishiChatbot from "@/components/chatbot/KrishiChatbot";


const RETAILERS = [
    {
        id: 1,
        name: "Anand Vegetable And Company",
        image: "/retailers/Anand Vegetable And Company.jpg",
        location: "Jalgaon City, Jalgaon",
        mapsLink: "https://maps.google.com/?q=Jalgaon",
        rating: 4.8,
        reviewsCount: 124,
        contact: "+91 98765 43210",
        vegetables: ["Onions", "Potatoes", "Tomatoes", "Cabbage"],
        verified: true,
    },
    {
        id: 2,
        name: "Athawade Bazaar",
        image: "/retailers/Athawade Bazaar.jpg",
        location: "Bhusawal, Jalgaon",
        mapsLink: "https://maps.google.com/?q=Bhusawal",
        rating: 4.5,
        reviewsCount: 89,
        contact: "+91 99887 76655",
        vegetables: ["Eggplant", "Spinach", "Garlic", "Ginger"],
        verified: true,
    },
    {
        id: 3,
        name: "Ekdunt Vegetables",
        image: "/retailers/Ekdunt Vegetables.jpg",
        location: "Chopda, Jalgaon",
        mapsLink: "https://maps.google.com/?q=Chopda",
        rating: 4.6,
        reviewsCount: 204,
        contact: "+91 88776 65544",
        vegetables: ["Carrots", "Beetroot", "Beans", "Peas"],
        verified: false,
    },
    {
        id: 4,
        name: "Hirman Bansi Mali And Sons",
        image: "/retailers/Hirman Bansi Mali And Sons.jpg",
        location: "Pachora, Jalgaon",
        mapsLink: "https://maps.google.com/?q=Pachora",
        rating: 4.9,
        reviewsCount: 341,
        contact: "+91 91234 56789",
        vegetables: ["Onions", "Cauliflower", "Chili", "Lemon"],
        verified: true,
    },
    {
        id: 5,
        name: "K.P. Traders",
        image: "/retailers/K.P. Traders.jpg",
        location: "Amalner, Jalgaon",
        mapsLink: "https://maps.google.com/?q=Amalner",
        rating: 4.3,
        reviewsCount: 67,
        contact: "+91 99881 12233",
        vegetables: ["Coriander", "Mint", "Fenugreek", "Radish"],
        verified: true,
    },
    {
        id: 6,
        name: "Mo. Younis S. Bismilla And Co.",
        image: "/retailers/Mo. Younis S. Bismilla And Co..jpg",
        location: "Yawal, Jalgaon",
        mapsLink: "https://maps.google.com/?q=Yawal",
        rating: 4.7,
        reviewsCount: 156,
        contact: "+91 88990 01122",
        vegetables: ["Tomatoes", "Cucumbers", "Pumpkins", "Onions"],
        verified: false,
    },
    {
        id: 7,
        name: "Nandini Trading Co.",
        image: "/retailers/Nandini Trading Co..jpg",
        location: "Raver, Jalgaon",
        mapsLink: "https://maps.google.com/?q=Raver",
        rating: 4.4,
        reviewsCount: 92,
        contact: "+91 77665 54433",
        vegetables: ["Bananas", "Drumsticks", "Curry Leaves"],
        verified: true,
    },
    {
        id: 8,
        name: "P. Shakhimal & Sons",
        image: "/retailers/P. Shakhimal & Sons.jpg",
        location: "Erandol, Jalgaon",
        mapsLink: "https://maps.google.com/?q=Erandol",
        rating: 4.6,
        reviewsCount: 178,
        contact: "+91 88552 23344",
        vegetables: ["Potatoes", "Onions", "Garlic", "Cabbage"],
        verified: true,
    },
    {
        id: 9,
        name: "RATNA TRADING COMPANY",
        image: "/retailers/RATNA TRADING COMPANY.jpg",
        location: "Jamner, Jalgaon",
        mapsLink: "https://maps.google.com/?q=Jamner",
        rating: 4.2,
        reviewsCount: 45,
        contact: "+91 99001 10099",
        vegetables: ["Bell Peppers", "Broccoli", "Lettuce", "Zucchini"],
        verified: false,
    },
    {
        id: 10,
        name: "Suresh Dada Jain Bhaji-Pala Market",
        image: "/retailers/Suresh Dada Jain Bhaji-Pala and Electronics Market.jpg",
        location: "MIDC, Jalgaon",
        mapsLink: "https://maps.google.com/?q=MIDC+Jalgaon",
        rating: 5.0,
        reviewsCount: 512,
        contact: "+91 91122 33445",
        vegetables: ["All Premium Vegetables", "Exotic Veggies", "Herbs"],
        verified: true,
    }
];

export default function RetailerDashboard() {
    return (
        <>
            {/* Premium Header */}
            <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-20">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center text-green-600 shadow-inner">
                                <ShoppingBasket className="w-7 h-7" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold bg-gradient-to-r from-green-700 to-emerald-500 bg-clip-text text-transparent">
                                    Krishisetu Retailers
                                </h1>
                                <p className="text-sm text-gray-500 font-medium">Maharashtra Marketplace</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="hidden md:flex items-center gap-2 bg-green-50 px-4 py-2 rounded-full border border-green-100 text-green-700 font-medium">
                                <MapPin className="w-4 h-4" />
                                <span>Showing {RETAILERS.length} Retailers in Jalgaon</span>
                            </div>
                            <button className="bg-gray-900 hover:bg-gray-800 text-white px-5 py-2.5 rounded-full font-medium transition-colors shadow-lg shadow-gray-200">
                                Log Out
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">

                {/* Page Title Section */}
                <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-6">
                    <div className="max-w-xl">
                        <h2 className="text-4xl font-extrabold tracking-tight text-gray-900 mb-3">
                            Verified Retailer Network
                        </h2>
                        <p className="text-lg text-gray-600 leading-relaxed">
                            Connect directly with top agricultural product retailers across Maharashtra. Wholesale rates and verified quality.
                        </p>
                    </div>

                    <div className="flex items-center gap-4 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
                        {['All', 'Verified', 'Top Rated', 'Nearby'].map((filter, i) => (
                            <button
                                key={filter}
                                className={`whitespace-nowrap px-6 py-2.5 rounded-full font-semibold transition-all duration-300 ${i === 0
                                    ? 'bg-green-600 text-white shadow-md shadow-green-200 hover:bg-green-700'
                                    : 'bg-white text-gray-600 border border-gray-200 hover:border-green-300 hover:text-green-600 hover:bg-green-50'
                                    }`}
                            >
                                {filter}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Retailers Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {RETAILERS.map((retailer) => (
                        <div
                            key={retailer.id}
                            className="group bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-2xl hover:shadow-green-900/10 transition-all duration-500 transform hover:-translate-y-2 flex flex-col h-full"
                        >
                            {/* Card Image */}
                            <div className="relative h-56 w-full overflow-hidden bg-gray-100">
                                {/* Fallback image style as Image component will handle the source */}
                                <img
                                    src={retailer.image}
                                    alt={retailer.name}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-in-out"
                                />

                                {/* Verified Badge */}
                                {retailer.verified && (
                                    <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm text-green-700 px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-lg border border-green-100">
                                        <ShieldCheck className="w-4 h-4 fill-green-100" /> Verified Seller
                                    </div>
                                )}

                                {/* Rating Badge */}
                                <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm text-gray-900 px-3 py-1.5 rounded-full text-sm font-bold flex items-center gap-1.5 shadow-lg">
                                    <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                                    {retailer.rating}
                                </div>

                                {/* Image Gradient Overlay */}
                                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-transparent to-transparent opacity-90" />

                                {/* Shop Name overlay on image */}
                                <div className="absolute bottom-4 left-5 right-5">
                                    <h3 className="text-xl font-bold text-white line-clamp-2 drop-shadow-md">
                                        {retailer.name}
                                    </h3>
                                </div>
                            </div>

                            {/* Card Body */}
                            <div className="p-6 flex flex-col flex-grow">

                                {/* Info List */}
                                <div className="space-y-4 mb-6 flex-grow">
                                    {/* Location & Maps Link */}
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-start gap-2.5 text-gray-600">
                                            <MapPin className="w-5 h-5 text-green-600 mt-0.5 shrink-0" />
                                            <span className="font-medium text-[15px]">{retailer.location}</span>
                                        </div>
                                        <a
                                            href={retailer.mapsLink}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-600 bg-blue-50 p-1.5 rounded-lg hover:bg-blue-100 transition-colors shrink-0 tooltip-trigger"
                                            title="View on Maps"
                                        >
                                            <ExternalLink className="w-4 h-4" />
                                        </a>
                                    </div>

                                    {/* Reviews & Contact */}
                                    <div className="flex items-center gap-4 text-sm text-gray-500">
                                        <div className="flex items-center gap-1.5 bg-gray-50 px-2.5 py-1 rounded-md">
                                            <span className="font-semibold text-gray-700">{retailer.reviewsCount}</span> Reviews
                                        </div>
                                        <div className="flex items-center gap-1.5 bg-gray-50 px-2.5 py-1 rounded-md">
                                            <Phone className="w-3.5 h-3.5 text-gray-400" /> {retailer.contact}
                                        </div>
                                    </div>

                                    {/* Vegetables Tags */}
                                    <div>
                                        <div className="flex items-center gap-2 mb-2">
                                            <Carrot className="w-4 h-4 text-orange-500" />
                                            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Available Stock</span>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {retailer.vegetables.map(veg => (
                                                <span key={veg} className="bg-green-50 border border-green-100 text-green-700 text-xs px-2.5 py-1 rounded-md font-medium">
                                                    {veg}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* View Details Button */}
                                <Link
                                    href={`/retailer/dashboard/${retailer.id}`}
                                    className="w-full bg-gray-900 text-white font-semibold py-3.5 rounded-xl hover:bg-green-600 hover:shadow-lg hover:shadow-green-600/30 transition-all duration-300 flex items-center justify-center gap-2 group/btn mt-auto"
                                >
                                    View full details
                                    <ExternalLink className="w-4 h-4 group-hover/btn:-translate-y-0.5 group-hover/btn:translate-x-0.5 transition-transform" />
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            </main>
            <KrishiChatbot />
        </>
    );
}
