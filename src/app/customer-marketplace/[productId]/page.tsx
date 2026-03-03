import { Suspense } from 'react';
import { CustomerProductDetailClient } from '@/components/features/customer-product-detail-client';

export default async function CustomerProductDetailPage({ params }: { params: Promise<{ productId: string }> }) {
    const resolvedParams = await params;
    return (
        <div className="space-y-8">
            <Suspense fallback={<div className="py-20 text-center animate-pulse">Loading supplier comparisons...</div>}>
                <CustomerProductDetailClient passedProductId={resolvedParams.productId} />
            </Suspense>
        </div>
    );
}
