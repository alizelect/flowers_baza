export function toOdd(value) {
    const normalized = Math.max(1, Math.round(value));
    return normalized % 2 === 0 ? normalized - 1 : normalized;
}
export function calcWithoutPromo(item, qty) {
    const secondaryUnitPrice = Number(item.secondaryUnitPrice) || 0;
    const flowersCost = secondaryUnitPrice > 0
        ? Math.ceil(qty / 2) * item.unitPrice + Math.floor(qty / 2) * secondaryUnitPrice
        : qty * item.unitPrice;
    const pistachioCost = item.hasPistachio ? item.pistachioQty * item.pistachioUnitPrice : 0;
    return flowersCost + item.packagingPrice + pistachioCost;
}
export function applyPromoRounding(rawPrice) {
    const rounded = Math.floor(rawPrice);
    return rounded % 100 === 0 ? Math.max(0, rounded - 10) : Math.max(0, rounded);
}
export function applyPromo15Rounding(rawPrice) {
    const lower = Math.floor(rawPrice / 5) * 5;
    const upper = lower + 5;
    const nearest = rawPrice - lower <= upper - rawPrice ? lower : upper;
    return Math.max(0, nearest);
}
export function applyPromo10Rounding(rawPrice) {
    const nearestInt = Math.round(rawPrice);
    const isInteger = Math.abs(rawPrice - nearestInt) < 1e-9;
    if (isInteger) {
        const lastDigit = ((nearestInt % 10) + 10) % 10;
        if (lastDigit === 5) {
            return Math.max(0, nearestInt);
        }
        if ([2, 3, 4, 6, 7, 8, 9].includes(lastDigit)) {
            const lower = Math.floor(nearestInt / 5) * 5;
            const upper = lower + 5;
            const nearest = nearestInt - lower <= upper - nearestInt ? lower : upper;
            return Math.max(0, nearest);
        }
    }
    return applyPromoRounding(rawPrice - 1);
}
export function calcWithPromo(item, qty) {
    const base = calcWithoutPromo(item, qty);
    if (!item.isPromoEnabled) {
        return base;
    }
    if (item.discountPercent === 15) {
        const promoRaw = base * 0.85 - 0.5;
        return applyPromo15Rounding(promoRaw);
    }
    if (item.discountPercent === 10) {
        return applyPromo10Rounding(base * 0.9);
    }
    return applyPromoRounding(base * (1 - item.discountPercent / 100));
}
