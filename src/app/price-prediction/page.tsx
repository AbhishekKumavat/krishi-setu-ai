'use client';

import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

const PricePredictionClient = dynamic(
    () => import("@/components/features/price-prediction-client").then(mod => mod.PricePredictionClient),
    {
        loading: () => (
            <div className="flex justify-center items-center py-20 flex-col gap-4">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <p className="animate-pulse">Loading AI Interface...</p>
            </div>
        ),
        ssr: false
    }
);

export default function PricePredictionPage() {
    return (
        <div className="space-y-8">
            <div className="space-y-2">
                <h1 className="font-headline text-3xl md:text-4xl font-bold tracking-tight">
                    Crop Price Prediction
                </h1>
                <p className="text-muted-foreground">
                    Predict the price of a crop based on region and date using our AI-powered model.
                </p>
            </div>
            <PricePredictionClient />
        </div>
    );
}

