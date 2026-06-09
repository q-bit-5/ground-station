import { describe, expect, it } from 'vitest';
import { buildMoonShadowPath, getMoonPhaseLabel, normalizePhase } from '../moonphase.js';

describe('moonphase helpers', () => {
    it('normalizes phase values into the canonical moon cycle range', () => {
        expect(normalizePhase(0.25)).toBeCloseTo(0.25);
        expect(normalizePhase(1.25)).toBeCloseTo(0.25);
        expect(normalizePhase(-0.25)).toBeCloseTo(0.75);
    });

    it('labels the main visible phase bands', () => {
        expect(getMoonPhaseLabel(0)).toBe('New Moon');
        expect(getMoonPhaseLabel(0.25)).toBe('First Quarter');
        expect(getMoonPhaseLabel(0.5)).toBe('Full Moon');
        expect(getMoonPhaseLabel(0.75)).toBe('Last Quarter');
    });

    it('builds no shadow at full moon and directional shadows otherwise', () => {
        expect(buildMoonShadowPath(0.5)).toBe('');
        expect(buildMoonShadowPath(0.25)).toContain('A50,50 0 0,0');
        expect(buildMoonShadowPath(0.75)).toContain('A50,50 0 0,1');
    });
});
