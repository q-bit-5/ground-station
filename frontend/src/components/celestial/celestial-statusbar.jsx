import React from 'react';
import { Box } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { WaterfallStatusBarPaper } from '../common/common.jsx';

const CelestialStatusBar = ({ planetsCount = 0, moonsCount = 0, trackedCount = 0 }) => {
    const { t } = useTranslation('celestial');

    return (
        <WaterfallStatusBarPaper>
            <Box
                sx={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 0.5,
                    fontSize: '0.75rem',
                    fontFamily: 'monospace',
                    color: 'text.secondary',
                    width: '100%',
                }}
            >
                <Box component="span">{t('statusbar.planets')}: <Box component="span" sx={{ fontWeight: 500 }}>{planetsCount}</Box></Box>
                <Box component="span" sx={{ opacity: 0.6 }}>|</Box>
                <Box component="span">{t('statusbar.moons')}: <Box component="span" sx={{ fontWeight: 500 }}>{moonsCount}</Box></Box>
                <Box component="span" sx={{ opacity: 0.6 }}>|</Box>
                <Box component="span">{t('statusbar.tracked')}: <Box component="span" sx={{ fontWeight: 500 }}>{trackedCount}</Box></Box>
            </Box>
        </WaterfallStatusBarPaper>
    );
};

export default React.memo(CelestialStatusBar);
