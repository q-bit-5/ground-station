import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSocket } from '../common/socket.jsx';
import {
    fetchNextPassesForGroup,
    setShowGeostationarySatellites,
} from './earthview-slice.jsx';
import PassTimeline from '../passes/timeline/pass-timeline.jsx';

const EarthViewPassTimeline = () => {
    const dispatch = useDispatch();
    const { socket } = useSocket();
    const passes = useSelector((state) => state.earthViewTrack.passes);
    const gridEditable = useSelector((state) => state.earthViewTrack.gridEditable);
    const nextPassesHours = useSelector((state) => state.earthViewTrack.nextPassesHours);
    const passesAreCached = useSelector((state) => state.earthViewTrack.passesAreCached);
    const passesLoading = useSelector((state) => state.earthViewTrack.passesLoading);
    const selectedSatGroupId = useSelector((state) => state.earthViewTrack.selectedSatGroupId);
    const selectedSatelliteId = useSelector((state) => state.earthViewTrack.selectedSatelliteId);
    const showGeostationarySatellites = useSelector((state) => state.earthViewTrack.showGeostationarySatellites);
    const passesRangeStart = useSelector((state) => state.earthViewTrack.passesRangeStart);
    const passesRangeEnd = useSelector((state) => state.earthViewTrack.passesRangeEnd);
    const groundStationLocation = useSelector((state) => state.location.location);
    const timezone = useSelector(
        (state) => {
            const timezonePref = state.preferences.preferences.find((pref) => pref.name === 'timezone');
            return timezonePref ? timezonePref.value : 'UTC';
        },
        (prev, next) => prev === next,
    );

    const handleRefreshPasses = () => {
        if (selectedSatGroupId) {
            dispatch(fetchNextPassesForGroup({
                socket,
                selectedSatGroupId,
                hours: nextPassesHours,
                forceRecalculate: true,
            }));
        }
    };

    const handleToggleGeostationary = () => {
        dispatch(setShowGeostationarySatellites(!showGeostationarySatellites));
    };

    return (
        <PassTimeline
            timeWindowHours={nextPassesHours}
            satelliteName={null}
            passes={passes}
            activePass={null}
            gridEditable={gridEditable}
            cachedOverride={passesAreCached}
            labelType="name"
            labelVerticalOffset={110}
            loading={passesLoading}
            nextPassesHours={nextPassesHours}
            onRefresh={handleRefreshPasses}
            showHoverElevation={false}
            showGeoToggle={true}
            showGeostationarySatellites={showGeostationarySatellites}
            onToggleGeostationary={handleToggleGeostationary}
            highlightActivePasses={true}
            highlightSatelliteId={selectedSatelliteId}
            forceTimeWindowStart={passesRangeStart}
            forceTimeWindowEnd={passesRangeEnd}
            groundStationLocation={groundStationLocation}
            timezone={timezone}
        />
    );
};

export default React.memo(EarthViewPassTimeline);
