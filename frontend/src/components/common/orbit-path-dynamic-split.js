/**
 * @license
 * Copyright (c) 2026 Efstratios Goudelis
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 *
 */

const isFiniteNumber = (value) => Number.isFinite(Number(value));

const normalizePathSegments = (pathData) => {
    if (!Array.isArray(pathData) || pathData.length === 0) {
        return [];
    }

    const firstEntry = pathData[0];
    const looksSegmented = Array.isArray(firstEntry)
        && firstEntry.length > 0
        && (Array.isArray(firstEntry[0]) || (firstEntry[0] && typeof firstEntry[0] === 'object'));

    return looksSegmented ? pathData : [pathData];
};

const normalizePoint = (point) => {
    if (Array.isArray(point) && point.length >= 2) {
        const lat = Number(point[0]);
        const lon = Number(point[1]);
        if (isFiniteNumber(lat) && isFiniteNumber(lon)) {
            return {lat, lon};
        }
        return null;
    }

    if (point && typeof point === 'object') {
        const lat = Number(point.lat);
        const lon = Number(point.lon ?? point.lng);
        if (isFiniteNumber(lat) && isFiniteNumber(lon)) {
            return {
                ...point,
                lat,
                lon,
            };
        }
    }
    return null;
};

const flattenSegments = (pathData) => {
    const segments = normalizePathSegments(pathData);
    const flattened = [];
    segments.forEach((segment) => {
        if (!Array.isArray(segment)) return;
        segment.forEach((point) => {
            const normalized = normalizePoint(point);
            if (normalized) {
                flattened.push(normalized);
            }
        });
    });
    return flattened;
};

const pointsEqual = (leftPoint, rightPoint, epsilon = 1e-6) => {
    if (!leftPoint || !rightPoint) return false;
    return (
        Math.abs(Number(leftPoint.lat) - Number(rightPoint.lat)) <= epsilon
        && Math.abs(Number(leftPoint.lon) - Number(rightPoint.lon)) <= epsilon
    );
};

const splitAtDateline = (points) => {
    if (!Array.isArray(points) || points.length === 0) {
        return [];
    }

    const segments = [];
    let currentSegment = [points[0]];

    for (let index = 1; index < points.length; index += 1) {
        const previous = points[index - 1];
        const current = points[index];
        if (Math.abs(current.lon - previous.lon) > 180) {
            segments.push(currentSegment);
            currentSegment = [current];
        } else {
            currentSegment.push(current);
        }
    }
    segments.push(currentSegment);
    return segments;
};

const angularLongitudeDistance = (leftLon, rightLon) => {
    const raw = Math.abs(Number(leftLon) - Number(rightLon));
    return Math.min(raw, 360 - raw);
};

const resolveSplitIndexBySatellitePosition = (combinedPath, fallbackIndex, satellitePosition) => {
    const satLat = Number(satellitePosition?.lat);
    const satLon = Number(satellitePosition?.lon);
    if (!isFiniteNumber(satLat) || !isFiniteNumber(satLon)) {
        return fallbackIndex;
    }

    let nearestIndex = fallbackIndex;
    let nearestScore = Number.POSITIVE_INFINITY;

    for (let index = 0; index < combinedPath.length; index += 1) {
        const point = combinedPath[index];
        const latDistance = point.lat - satLat;
        const lonDistance = angularLongitudeDistance(point.lon, satLon);
        const score = (latDistance * latDistance) + (lonDistance * lonDistance);
        if (score < nearestScore) {
            nearestScore = score;
            nearestIndex = index;
        }
    }

    return nearestIndex;
};

export const resolveDynamicOrbitPathSegments = ({
    pastPath,
    futurePath,
    satellitePosition,
}) => {
    const pastPoints = flattenSegments(pastPath);
    const futurePoints = flattenSegments(futurePath);

    if (pastPoints.length === 0 && futurePoints.length === 0) {
        return {past: [], future: []};
    }

    const hasSharedJoinPoint = pastPoints.length > 0
        && futurePoints.length > 0
        && pointsEqual(pastPoints[pastPoints.length - 1], futurePoints[0]);
    const combinedPath = hasSharedJoinPoint
        ? [...pastPoints, ...futurePoints.slice(1)]
        : [...pastPoints, ...futurePoints];

    if (combinedPath.length === 0) {
        return {past: [], future: []};
    }

    const fallbackIndex = pastPoints.length > 0
        ? Math.max(0, pastPoints.length - 1)
        : 0;
    const splitIndex = resolveSplitIndexBySatellitePosition(
        combinedPath,
        fallbackIndex,
        satellitePosition,
    );

    const dynamicPastPoints = combinedPath.slice(0, splitIndex + 1);
    const dynamicFuturePoints = combinedPath.slice(splitIndex);

    return {
        past: splitAtDateline(dynamicPastPoints),
        future: splitAtDateline(dynamicFuturePoints),
    };
};
