import { describe, expect, it } from 'vitest';
import { applyPromoRounding } from './pricing';
describe('promo rounding', () => {
    it('rounds down to tens', () => {
        expect(applyPromoRounding(1881)).toBe(1880);
        expect(applyPromoRounding(1889)).toBe(1880);
    });
    it('avoids 00 ending', () => {
        expect(applyPromoRounding(1800)).toBe(1790);
        expect(applyPromoRounding(100)).toBe(90);
    });
    it('never negative', () => {
        expect(applyPromoRounding(0)).toBe(0);
        expect(applyPromoRounding(9)).toBe(0);
    });
});
