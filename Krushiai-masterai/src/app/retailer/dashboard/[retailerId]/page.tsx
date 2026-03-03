"use client";

import { useState, use } from "react";
import { Star, MapPin, Phone, Carrot, Plus, Wheat, ShoppingCart, ArrowLeft, ArrowUpCircle, ExternalLink, X, Trash2, Pencil } from "lucide-react";
import { RETAILERS } from "../../data";
import { notFound } from "next/navigation";
import Link from "next/link";
import KrishiChatbot from "@/components/chatbot/KrishiChatbot";

const CROP_OPTIONS = [
    { name: "Wheat", price: 30 },
    { name: "Rice", price: 40 },
    { name: "Jowar", price: 25 },
    { name: "Bajra", price: 22 },
    { name: "Maize", price: 20 },
    { name: "Cotton", price: 65 },
    { name: "Soybean", price: 45 },
    { name: "Sugarcane", price: 5 },
    { name: "Onions", price: 20 },
    { name: "Potatoes", price: 15 },
    { name: "Tomatoes", price: 30 },
    { name: "Garlic", price: 80 },
    { name: "Ginger", price: 120 },
    { name: "Turmeric", price: 100 },
    { name: "Chili", price: 90 },
    { name: "Cabbage", price: 10 },
    { name: "Cauliflower", price: 12 },
    { name: "Groundnut", price: 55 },
    { name: "Mustard", price: 48 },
    { name: "Tur Dal", price: 60 }
];

export default function RetailerDetails({ params }: { params: Promise<{ retailerId: string }> }) {
    const { retailerId } = use(params);
    const retailer = RETAILERS.find(r => r.id === retailerId);

    if (!retailer) {
        return notFound();
    }

    const [stock, setStock] = useState<typeof retailer.stock>([]);
    const [isAddMenuOpen, setIsAddMenuOpen] = useState(false);
    const [pendingCrop, setPendingCrop] = useState<string | null>(null);
    const [manualPrice, setManualPrice] = useState<string>("");
    const [manualQuantity, setManualQuantity] = useState<string>("1");
    const [unit, setUnit] = useState<"Quintal" | "Kg">("Quintal");
    const [editingCropId, setEditingCropId] = useState<string | null>(null);



    const handleIncreasePrice = (itemId: string) => {
        setStock(currentStock =>
            currentStock.map(item =>
                item.id === itemId
                    ? { ...item, pricePerKg: item.pricePerKg + 1 }
                    : item
            )
        );
    };

    const handleSelectCrop = (cropName: string) => {
        setPendingCrop(cropName);
        setManualPrice("");
    };

    const handleConfirmCropPrice = () => {
        if (!pendingCrop || !manualPrice || !manualQuantity) return;

        if (editingCropId) {
            setStock(currentStock =>
                currentStock.map(item =>
                    item.id === editingCropId
                        ? { ...item, pricePerKg: parseInt(manualPrice) || 0, quantity: `${manualQuantity} ${unit}` }
                        : item
                )
            );
            setEditingCropId(null);
        } else {
            const newCrop = {
                id: `s-${Date.now()}`,
                name: pendingCrop,
                pricePerKg: parseInt(manualPrice) || 0,
                quantity: `${manualQuantity} ${unit}`
            };
            setStock([...stock, newCrop]);
        }

        setPendingCrop(null);
        setIsAddMenuOpen(false);
        setManualQuantity("1");
    };

    const handleEditCrop = (item: any) => {
        setEditingCropId(item.id);
        setPendingCrop(item.name);
        setManualPrice(item.pricePerKg.toString());

        const qtyParts = item.quantity.split(" ");
        if (qtyParts.length >= 2) {
            setManualQuantity(qtyParts[0]);
            setUnit(qtyParts[1] as "Quintal" | "Kg");
        }

        setIsAddMenuOpen(true);
    };

    const handleDeleteCrop = (itemId: string) => {
        setStock(currentStock => currentStock.filter(item => item.id !== itemId));
    };

    return (
        <>
            {/* Header */}
            <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-20">
                        <Link href="/retailer/dashboard" className="flex items-center gap-2 text-gray-600 hover:text-green-600 transition-colors font-semibold group">
                            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                            Back to Market
                        </Link>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center text-green-600 shadow-inner">
                                <Carrot className="w-6 h-6" />
                            </div>
                            <h1 className="text-xl font-bold bg-gradient-to-r from-green-700 to-emerald-500 bg-clip-text text-transparent hidden sm:block">
                                Quick Purchase
                            </h1>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
                {/* Hero / Store Front */}
                <div className="bg-white rounded-3xl overflow-hidden shadow-lg border border-gray-100 mb-8 flex flex-col md:flex-row">
                    <div className="w-full md:w-2/5 h-72 md:h-auto relative">
                        <img
                            src={retailer.image}
                            alt={retailer.name}
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-gray-900/80 via-gray-900/30 to-transparent" />

                        <div className="absolute bottom-6 left-6 right-6">
                            <h2 className="text-3xl font-extrabold text-white mb-2 drop-shadow-lg">{retailer.name}</h2>
                            <div className="flex items-center gap-3">
                                <span className="bg-yellow-500 text-white px-2.5 py-1 rounded-md text-sm font-bold flex items-center gap-1 shadow-md">
                                    <Star className="w-4 h-4 fill-white" /> {retailer.rating}
                                </span>
                                <span className="text-gray-200 text-sm font-medium drop-shadow-md">
                                    ({retailer.reviewsCount} verified reviews)
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="w-full md:w-3/5 p-8 flex flex-col justify-center bg-white relative">
                        {/* Watermark leaf */}
                        <Carrot className="absolute right-0 bottom-0 w-64 h-64 text-green-50/50 -rotate-12 translate-x-10 translate-y-10 pointer-events-none" />

                        <div className="space-y-6 relative z-10">
                            <div className="flex items-start gap-4 p-4 rounded-2xl bg-gray-50 border border-gray-100">
                                <div className="p-3 bg-white rounded-xl shadow-sm">
                                    <MapPin className="w-6 h-6 text-red-500" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 text-lg">Store Location</h3>
                                    <p className="text-gray-600 mt-1 leading-relaxed">{retailer.location}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4 p-4 rounded-2xl bg-gray-50 border border-gray-100">
                                <div className="p-3 bg-white rounded-xl shadow-sm">
                                    <Phone className="w-6 h-6 text-blue-500" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 text-lg">Contact Information</h3>
                                    <p className="text-gray-600 mt-1 font-medium text-lg">{retailer.contact}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Two Column Layout for Map and Stock */}
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Left Column: Google Maps Embed */}
                    <div className="w-full lg:w-1/3 space-y-6">
                        <div className="bg-white rounded-3xl p-6 shadow-md border border-gray-100">
                            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <MapPin className="w-5 h-5 text-green-600" /> Live Maps
                            </h3>
                            <div className="w-full h-80 rounded-2xl overflow-hidden bg-gray-100 border border-gray-200 shadow-inner relative">
                                {retailer.iframeLink ? (
                                    <iframe
                                        src={retailer.iframeLink}
                                        width="100%"
                                        height="100%"
                                        style={{ border: 0 }}
                                        allowFullScreen={false}
                                        loading="lazy"
                                        referrerPolicy="no-referrer-when-downgrade"
                                        className="absolute inset-0 w-full h-full"
                                    ></iframe>
                                ) : (
                                    <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                                        No map data available
                                    </div>
                                )}
                            </div>
                            <a
                                href={retailer.mapsLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mt-4 w-full bg-gray-50 hover:bg-gray-100 text-gray-700 font-semibold py-3 rounded-xl border border-gray-200 transition-colors flex items-center justify-center gap-2"
                            >
                                Open Google Maps <ExternalLink className="w-4 h-4" />
                            </a>
                        </div>
                    </div>

                    {/* Right Column: Stock to Buy */}
                    <div className="w-full lg:w-2/3">
                        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-md border border-gray-100">
                            <div className="flex justify-between items-center mb-8 border-b border-gray-100 pb-6">
                                <div>
                                    <h3 className="text-2xl font-black text-gray-900 flex items-center gap-3">
                                        <ShoppingCart className="w-7 h-7 text-green-600" /> Manage Inventory
                                    </h3>
                                    <p className="text-gray-500 mt-1 font-medium">Configure wholesale market prices and available stock</p>
                                </div>

                                <button
                                    onClick={() => setIsAddMenuOpen(true)}
                                    className="bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-full font-bold shadow-md shadow-green-200 transition-all active:scale-95 flex items-center gap-2 group"
                                >
                                    <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" /> Add Crop
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {stock.map(item => (
                                    <div key={item.id} className={`p-5 rounded-2xl border-2 transition-all duration-300 ${item.name.toLowerCase() === 'wheat' ? 'border-amber-400 bg-amber-50 shadow-sm' : 'border-gray-100 bg-white hover:border-green-200 hover:shadow-md'}`}>
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className={`p-2.5 rounded-lg ${item.name.toLowerCase() === 'wheat' ? 'bg-amber-100 text-amber-700' : 'bg-green-50 text-green-600'}`}>
                                                    {item.name.toLowerCase() === 'wheat' ? <Wheat className="w-6 h-6" /> : <Carrot className="w-6 h-6" />}
                                                </div>
                                                <div>
                                                    <h4 className="font-extrabold text-lg text-gray-900">{item.name}</h4>
                                                    <span className="text-sm font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md mt-1 inline-block">
                                                        Stock: {item.quantity}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100/50">
                                            <div className="flex flex-col">
                                                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Price / Quintal</span>
                                                <div className="text-2xl font-black text-green-700">
                                                    ₹{item.pricePerKg}
                                                </div>
                                            </div>

                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleEditCrop(item)}
                                                    className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center justify-center transition-colors border border-gray-200"
                                                    title="Edit crop details"
                                                >
                                                    <Pencil className="w-5 h-5" />
                                                </button>
                                                <button
                                                    onClick={() => handleIncreasePrice(item.id)}
                                                    className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center justify-center transition-colors border border-gray-200"
                                                    title="Increase price by ₹1 (Demo)"
                                                >
                                                    <ArrowUpCircle className="w-5 h-5" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteCrop(item.id)}
                                                    className="w-10 h-10 rounded-xl bg-red-50 hover:bg-red-100 text-red-500 hover:text-red-600 flex items-center justify-center transition-colors border border-red-100"
                                                    title="Remove crop"
                                                >
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Add/Edit Crop Modal Overlay */}
            {isAddMenuOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200" onClick={() => { setIsAddMenuOpen(false); setPendingCrop(null); setEditingCropId(null); }}>
                    <div
                        className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50/50">
                            <div>
                                <h3 className="text-2xl font-black text-gray-900">{pendingCrop ? (editingCropId ? `Edit ${pendingCrop}` : `Set Price for ${pendingCrop}`) : 'Select Crop to Add'}</h3>
                                <p className="text-gray-500 mt-1 font-medium text-sm">{pendingCrop ? 'Enter current daily market wholesale rate' : 'Prices fluctuate dynamically, choose crop first'}</p>
                            </div>
                            <button
                                onClick={() => { setIsAddMenuOpen(false); setPendingCrop(null); setEditingCropId(null); }}
                                className="p-2 bg-gray-100 hover:bg-red-100 hover:text-red-600 rounded-full transition-colors text-gray-500"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto">
                            {pendingCrop ? (
                                <div className="flex flex-col items-center justify-center py-8">
                                    <div className="w-20 h-20 bg-green-50 rounded-2xl flex items-center justify-center mb-6 text-green-600 shadow-sm border border-green-100">
                                        <Carrot className="w-10 h-10" />
                                    </div>
                                    <h4 className="text-3xl font-black text-gray-900 mb-2">{pendingCrop}</h4>
                                    <p className="text-gray-500 mb-6 text-center max-w-sm">
                                        Market prices fluctuate daily. Enter the price and the quantity of stock available for this wholesale crop.
                                    </p>

                                    <div className="flex flex-col gap-4 w-full max-w-sm">
                                        <div className="relative">
                                            <span className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500 font-bold text-xl">₹</span>
                                            <input
                                                type="number"
                                                value={manualPrice}
                                                onChange={(e) => setManualPrice(e.target.value)}
                                                placeholder={`Enter price per ${unit}`}
                                                className="w-full bg-gray-50 border-2 border-gray-200 rounded-xl py-4 pl-10 pr-4 text-xl font-bold text-gray-900 focus:outline-none focus:border-green-500 focus:ring-4 focus:ring-green-500/20 transition-all text-center"
                                                autoFocus
                                            />
                                        </div>

                                        <div className="flex gap-2">
                                            <input
                                                type="number"
                                                value={manualQuantity}
                                                onChange={(e) => setManualQuantity(e.target.value)}
                                                placeholder="Amount"
                                                className="w-2/3 bg-gray-50 border-2 border-gray-200 rounded-xl py-4 px-4 text-xl font-bold text-gray-900 focus:outline-none focus:border-green-500 focus:ring-4 focus:ring-green-500/20 transition-all text-center"
                                            />
                                            <select
                                                value={unit}
                                                onChange={(e) => setUnit(e.target.value as "Quintal" | "Kg")}
                                                className="w-1/3 bg-gray-50 border-2 border-gray-200 rounded-xl py-4 px-2 text-lg font-bold text-gray-900 focus:outline-none focus:border-green-500 focus:ring-4 focus:ring-green-500/20 transition-all cursor-pointer appearance-none text-center"
                                            >
                                                <option value="Quintal">Quintal</option>
                                                <option value="Kg">Kg</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="flex gap-4 mt-8">
                                        <button
                                            onClick={() => { setPendingCrop(null); setEditingCropId(null); }}
                                            className="px-8 py-3.5 rounded-xl font-bold bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                                        >
                                            {editingCropId ? 'Cancel' : 'Back Option'}
                                        </button>
                                        <button
                                            onClick={handleConfirmCropPrice}
                                            disabled={!manualPrice}
                                            className="px-8 py-3.5 rounded-xl font-bold bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-green-200 transition-all flex items-center gap-2"
                                        >
                                            {editingCropId ? 'Update Detail' : 'Confirm Price'} <Plus className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                    {CROP_OPTIONS.map((crop) => (
                                        <button
                                            key={crop.name}
                                            onClick={() => handleSelectCrop(crop.name)}
                                            className="flex flex-col items-center justify-center p-4 rounded-2xl border-2 border-gray-100 hover:border-green-500 hover:bg-opacity-50 hover:bg-green-50 transition-all group active:scale-[0.98]"
                                        >
                                            <div className="w-12 h-12 bg-gray-50 group-hover:bg-white rounded-xl flex items-center justify-center mb-3 shadow-sm text-green-600 group-hover:scale-110 transition-transform">
                                                {crop.name === 'Wheat' || crop.name === 'Rice' || crop.name === 'Maize' || crop.name === 'Jowar' || crop.name === 'Bajra' || crop.name === 'Soybean' ? (
                                                    <Wheat className="w-6 h-6" />
                                                ) : (
                                                    <Carrot className="w-6 h-6" />
                                                )}
                                            </div>
                                            <span className="font-bold text-gray-900 text-center">{crop.name}</span>
                                            <span className="text-xs text-blue-500/80 font-bold tracking-wider uppercase mt-1">Custom Rate</span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div >
            <KrishiChatbot />
        </>
    );
}
