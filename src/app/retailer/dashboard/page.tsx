"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RetailerDashboardIndex() {
    const router = useRouter();

    // Redirect to the first retailer or a default one
    useEffect(() => {
        // In a real app, you might fetch the logged-in retailer's ID
        // For now, we'll redirect to a default retailer
        router.push('/retailer/dashboard/1');
    }, [router]);

    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
                <p className="text-lg text-gray-600">Redirecting to retailer dashboard...</p>
            </div>
        </div>
    );
}