'use client';

import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

const SettingsCropRecommendation = dynamic(
    () => import("@/components/features/settings-crop-recommendation").then(mod => mod.SettingsCropRecommendation),
    {
        loading: () => (
            <div className="flex justify-center flex-col gap-4 items-center py-20">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <p className="animate-pulse">Loading AI Interface...</p>
            </div>
        ),
        ssr: false
    }
);

export default function CropRecommendationPage() {
    return (
        <div className="space-y-8">
            <div className="space-y-2">
                <h1 className="font-headline text-3xl md:text-4xl font-bold tracking-tight">
                    Crop Recommendation
                </h1>
                <p className="text-muted-foreground">
                    Get crop recommendations based on your location and local weather data from our API-powered model.
                </p>
            </div>
            <SettingsCropRecommendation />
        </div>
    );
}
