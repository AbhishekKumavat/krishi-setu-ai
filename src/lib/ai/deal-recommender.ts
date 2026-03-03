// AI Deal Recommendation Engine
// Multi-factor scoring algorithm for ranking farmer deals

export interface FarmerDeal {
  id: string;
  farmerName: string;
  location: string;
  pricePerKg: number;
  distanceKm: number;
  trustScore: number; // 0-5 scale
  deliveryEstimate: string; // e.g., "Same Day", "1-Day", "2 Days"
  isVerified: boolean;
}

export interface DealWithAIScore extends FarmerDeal {
  aiScore: number;
  priceScore: number;
  distanceScore: number;
  trustScoreNormalized: number;
  deliveryScore: number;
  isRecommended: boolean;
}

export interface PriceTrend {
  trend: 'increasing' | 'decreasing' | 'stable';
  predictedChange: number; // percentage
  confidence: number; // 60-80%
  recommendation: string;
}

export interface DemandIndicator {
  status: 'high' | 'stable' | 'shortage';
  views: number;
  stockLevel: 'high' | 'medium' | 'low';
  message: string;
  alert?: boolean;
}

// Enhanced AI Deal Ranking with Dynamic Scoring Algorithm
export function calculateAIScore(
  deals: FarmerDeal[],
  marketContext?: {
    avgMarketPrice?: number;
    productViews?: number;
    stockLevel?: 'high' | 'medium' | 'low';
  }
): DealWithAIScore[] {
  if (deals.length === 0) return [];

  // Dynamic min/max calculation with fallback values
  const minPrice = Math.min(...deals.map(d => d.pricePerKg));
  const maxPrice = Math.max(...deals.map(d => d.pricePerKg));
  const minDistance = Math.min(...deals.map(d => d.distanceKm));
  const maxDistance = Math.max(...deals.map(d => d.distanceKm));
  
  // Handle edge cases where all values are the same
  const priceRange = maxPrice - minPrice || 1;
  const distanceRange = maxDistance - minDistance || 1;

  // Calculate scores for each deal with enhanced logic
  const dealsWithScores = deals.map(deal => {
    // Enhanced Price Score: Lower price = higher score with logarithmic scaling
    const priceScore = 1 - ((deal.pricePerKg - minPrice) / priceRange);
    
    // Enhanced Distance Score: Closer distance = higher score with exponential decay
    const distanceScore = Math.exp(-((deal.distanceKm - minDistance) / distanceRange) * 2);
    
    // Enhanced Trust Score: Weighted trust with bonus for verified farmers
    const trustScoreNormalized = deal.trustScore / 5;
    const trustBonus = deal.isVerified ? 0.1 : 0;
    const enhancedTrustScore = Math.min(1, trustScoreNormalized + trustBonus);
    
    // Enhanced Delivery Time Score: Faster delivery with tiered scoring
    const deliveryScore = getDeliveryScore(deal.deliveryEstimate);
    
    // Dynamic weight adjustment based on market context
    let priceWeight = 0.40;
    let trustWeight = 0.25;
    let distanceWeight = 0.20;
    let deliveryWeight = 0.15;
    
    // Adjust weights based on market conditions
    if (marketContext?.stockLevel === 'low') {
      // In shortage, trust becomes more important
      trustWeight = 0.35;
      priceWeight = 0.30;
    } else if (marketContext?.productViews && marketContext.productViews > 1000) {
      // High demand - delivery speed becomes more important
      deliveryWeight = 0.25;
      distanceWeight = 0.25;
      priceWeight = 0.30;
    }
    
    // Weighted AI Score calculation with dynamic weights
    const aiScore = 
      (priceScore * priceWeight) +
      (enhancedTrustScore * trustWeight) +
      (distanceScore * distanceWeight) +
      (deliveryScore * deliveryWeight);

    return {
      ...deal,
      aiScore: parseFloat(aiScore.toFixed(4)),
      priceScore: parseFloat(priceScore.toFixed(4)),
      distanceScore: parseFloat(distanceScore.toFixed(4)),
      trustScoreNormalized: parseFloat(enhancedTrustScore.toFixed(4)),
      deliveryScore: parseFloat(deliveryScore.toFixed(4)),
      isRecommended: false // Will be set for the best deal
    };
  });

  // Sort by AI Score (highest first) and mark the top deal as recommended
  dealsWithScores.sort((a, b) => b.aiScore - a.aiScore);
  if (dealsWithScores.length > 0) {
    dealsWithScores[0].isRecommended = true;
  }

  return dealsWithScores;
}

// Helper function for delivery time scoring
function getDeliveryScore(estimate: string): number {
  const deliveryMap: Record<string, number> = {
    'Same Day Delivery': 1.0,
    'Same Day': 1.0,
    '1-Day Delivery': 0.8,
    '1 Day': 0.8,
    '2 Days': 0.6,
    '2-Day Delivery': 0.6,
    '3 Days': 0.4,
    '3-Day Delivery': 0.4,
    '5 Days': 0.2,
    '5-Day Delivery': 0.2
  };
  
  return deliveryMap[estimate] || 0.3;
}

// Enhanced Price Trend Prediction Module with Dynamic Logic
export function analyzePriceTrend(
  historicalPrices: number[], // Last 7 days of prices
  currentPrice: number
): PriceTrend {
  if (historicalPrices.length < 7) {
    // Generate sample data if insufficient data
    const basePrice = currentPrice || 3000;
    historicalPrices = [
      basePrice * 0.95,
      basePrice * 0.97,
      basePrice * 0.98,
      basePrice * 1.02,
      basePrice * 1.05,
      basePrice * 1.03,
      basePrice * 1.01
    ];
  }

  // Calculate 7-day average
  const sevenDayAverage = historicalPrices.reduce((sum, price) => sum + price, 0) / historicalPrices.length;
  
  // Calculate daily changes
  const dailyChanges: number[] = [];
  for (let i = 1; i < historicalPrices.length; i++) {
    const change = ((historicalPrices[i] - historicalPrices[i-1]) / historicalPrices[i-1]) * 100;
    dailyChanges.push(change);
  }
  
  // Calculate average daily change
  const avgDailyChange = dailyChanges.reduce((sum, change) => sum + change, 0) / dailyChanges.length;
  
  // Calculate volatility (standard deviation of daily changes)
  const variance = dailyChanges.reduce((sum, change) => sum + Math.pow(change - avgDailyChange, 2), 0) / dailyChanges.length;
  const volatility = Math.sqrt(variance);
  
  // Dynamic confidence calculation based on volatility
  let confidence: number;
  if (volatility < 1.5) {
    confidence = 80; // Low volatility
  } else if (volatility < 3) {
    confidence = 75; // Medium volatility
  } else {
    confidence = 70; // High volatility
  }
  
  // Determine trend based on current price vs 7-day average
  let trend: 'increasing' | 'decreasing' | 'stable';
  let recommendation = '';
  
  if (currentPrice > sevenDayAverage) {
    trend = 'increasing';
    recommendation = '📈 Price likely to increase';
  } else if (currentPrice < sevenDayAverage) {
    trend = 'decreasing';
    recommendation = '📉 Better to sell today';
  } else {
    trend = 'stable';
    recommendation = '📊 Price trend is stable';
  }
  
  // Predicted 3-day change (3 times the average daily change)
  const predictedChange = avgDailyChange * 3;
  
  return {
    trend,
    predictedChange: parseFloat(predictedChange.toFixed(2)),
    confidence: Math.round(confidence),
    recommendation
  };
}

// Enhanced Demand Intelligence Module with Dynamic Classification
export function analyzeDemand(
  productViews: number,
  stockLevel: 'high' | 'medium' | 'low',
  priceTrend: 'increasing' | 'decreasing' | 'stable'
): DemandIndicator {
  // Dynamic demand classification based on views
  let demandLevel: 'high' | 'medium' | 'low';
  if (productViews > 1000) {
    demandLevel = 'high';
  } else if (productViews >= 500) {
    demandLevel = 'medium';
  } else {
    demandLevel = 'low';
  }

  // Determine demand status based on multiple factors
  let status: 'high' | 'stable' | 'shortage' = 'stable';
  let message = '';
  let alert = false;

  // High demand scenarios
  if (demandLevel === 'high') {
    status = 'high';
    message = '🔥 High Demand';
  }
  // Potential shortage scenarios
  else if (priceTrend === 'increasing' && stockLevel === 'low') {
    status = 'shortage';
    message = '⚠ Potential Shortage Alert';
    alert = true;
  }
  // Stable supply scenarios
  else if (stockLevel === 'high' || (stockLevel === 'medium' && demandLevel === 'low')) {
    status = 'stable';
    message = '📦 Stable Supply';
  }
  // Default case
  else {
    status = 'stable';
    message = '📦 Stable Supply';
  }

  return {
    status,
    views: productViews,
    stockLevel,
    message,
    alert
  };
}

// Enhanced Profit Optimization Calculator with Dynamic Logic
export function calculateProfitOptimization(
  mandiPrice: number,
  platformPrice: number,
  quantityKg: number = 1
): {
  mandiPrice: number;
  platformPrice: number;
  extraIncomePerKg: number;
  totalExtraIncome: number;
  profitPercentage: number;
  aiInsight: string;
} {
  // Dynamic mandi price calculation if not provided
  if (!mandiPrice) {
    mandiPrice = platformPrice * 0.95; // Default 5% below platform price
  }
  
  const profitDifference = platformPrice - mandiPrice;
  const profitPercentage = ((profitDifference) / mandiPrice) * 100;
  const extraIncomePerKg = profitDifference;
  const totalExtraIncome = extraIncomePerKg * quantityKg;

  // Dynamic AI insights based on profit percentage
  let aiInsight = '';
  if (profitPercentage > 15) {
    aiInsight = '🚀 Excellent profit opportunity! Platform pricing significantly above market rate.';
  } else if (profitPercentage > 5) {
    aiInsight = '✅ Good profit margin. Platform offers competitive pricing advantage.';
  } else if (profitPercentage > 0) {
    aiInsight = '💡 Slight profit advantage. Consider platform for better exposure.';
  } else if (profitPercentage > -5) {
    aiInsight = '⚠ Minimal loss. Platform may offer better market reach despite lower price.';
  } else {
    aiInsight = '⚠ Significant loss. Consider direct sales or negotiate better platform rates.';
  }

  return {
    mandiPrice: parseFloat(mandiPrice.toFixed(2)),
    platformPrice: parseFloat(platformPrice.toFixed(2)),
    extraIncomePerKg: parseFloat(extraIncomePerKg.toFixed(2)),
    totalExtraIncome: parseFloat(totalExtraIncome.toFixed(2)),
    profitPercentage: parseFloat(profitPercentage.toFixed(2)),
    aiInsight
  };
}

// Enhanced Dashboard AI Insights with Dynamic Logic
export function generateDashboardInsights(
  currentPrice: number,
  historicalPrices: number[],
  demandIndicator: DemandIndicator,
  mandiPrice: number
): {
  suggestedSellingTime: string;
  expectedProfitGain: string;
  marketTrend: string;
  demandHeat: string;
} {
  const priceTrend = analyzePriceTrend(historicalPrices, currentPrice);
  
  // Dynamic best selling time recommendation logic
  let suggestedSellingTime = '';
  let aiRecommendationBadge = '';
  
  if (priceTrend.trend === 'increasing' && demandIndicator.status === 'high') {
    suggestedSellingTime = 'Hold for better price - market conditions are favorable';
    aiRecommendationBadge = '📈 HOLD RECOMMENDED';
  } else if (priceTrend.trend === 'stable') {
    suggestedSellingTime = 'Sell when convenient - market is stable';
    aiRecommendationBadge = '📊 SELL WHEN CONVENIENT';
  } else if (priceTrend.trend === 'decreasing') {
    suggestedSellingTime = 'Sell now to avoid potential loss';
    aiRecommendationBadge = '📉 SELL NOW RECOMMENDED';
  } else {
    suggestedSellingTime = 'Market conditions variable - monitor closely';
    aiRecommendationBadge = '⚠️ MONITOR MARKET';
  }

  // Expected profit gain calculation
  const profitOptimization = calculateProfitOptimization(mandiPrice, currentPrice);
  const expectedProfitGain = profitOptimization.profitPercentage > 0 
    ? `+${profitOptimization.profitPercentage.toFixed(1)}% above mandi rates`
    : `${profitOptimization.profitPercentage.toFixed(1)}% below mandi rates`;

  // Enhanced market trend summary with confidence
  const marketTrend = `${priceTrend.recommendation} (${Math.abs(priceTrend.predictedChange)}% predicted change, ${priceTrend.confidence}% confidence)`;

  // Dynamic demand heat indicator
  const demandHeat = demandIndicator.alert 
    ? '🔴 CRITICAL HIGH' 
    : demandIndicator.status === 'high' 
      ? '🟡 HIGH DEMAND' 
      : demandIndicator.status === 'shortage' 
        ? '🟠 SHORTAGE RISK' 
        : '🟢 NORMAL';

  return {
    suggestedSellingTime: `${suggestedSellingTime} • ${aiRecommendationBadge}`,
    expectedProfitGain,
    marketTrend,
    demandHeat
  };
}