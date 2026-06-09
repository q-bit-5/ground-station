import SunCalc from 'suncalc';

const MOON_PHASES = Object.freeze([
    { limit: 0.03, label: 'New Moon' },
    { limit: 0.22, label: 'Waxing Crescent' },
    { limit: 0.28, label: 'First Quarter' },
    { limit: 0.47, label: 'Waxing Gibbous' },
    { limit: 0.53, label: 'Full Moon' },
    { limit: 0.72, label: 'Waning Gibbous' },
    { limit: 0.78, label: 'Last Quarter' },
    { limit: 0.97, label: 'Waning Crescent' },
    { limit: 1.01, label: 'New Moon' },
]);

export const normalizePhase = (phase) => {
    const numericPhase = Number(phase);
    if (!Number.isFinite(numericPhase)) return 0;
    return ((numericPhase % 1) + 1) % 1;
};

export const getMoonPhaseLabel = (phase) => {
    const normalizedPhase = normalizePhase(phase);
    return MOON_PHASES.find((entry) => normalizedPhase < entry.limit)?.label || 'Moon Phase';
};

export const getMoonIllumination = (date = new Date()) => {
    const illumination = SunCalc.getMoonIllumination(date);
    const phase = normalizePhase(illumination?.phase);
    const fraction = Math.max(0, Math.min(1, Number(illumination?.fraction) || 0));
    const label = getMoonPhaseLabel(phase);
    return {
        phase,
        fraction,
        label,
        description: `${label}, ${Math.round(fraction * 100)}% illuminated`,
    };
};

export const buildMoonShadowPath = (phase) => {
    const normalizedPhase = normalizePhase(phase);

    if (normalizedPhase >= 0.485 && normalizedPhase <= 0.515) {
        return '';
    }

    if (normalizedPhase <= 0.015 || normalizedPhase >= 0.985) {
        return 'M50,0 A50,50 0 1 1 49.99,0 Z';
    }

    if (normalizedPhase < 0.5) {
        const curveX = 100 - (normalizedPhase * 200);
        return `M50,0 A50,50 0 0,0 50,100 Q${curveX.toFixed(2)},50 50,0 Z`;
    }

    const curveX = 200 - (normalizedPhase * 200);
    return `M50,0 A50,50 0 0,1 50,100 Q${curveX.toFixed(2)},50 50,0 Z`;
};
