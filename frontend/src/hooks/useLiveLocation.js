import { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";

import { haversineDistance, watchPosition } from "../services/location.service";
import { updateMyLocationThunk } from "../redux/rider/riderThunk";

/**
 * Share the rider's live GPS position with the server.
 *
 * Watches the device position while `enabled` is true and pushes it to the API,
 * which then broadcasts it to everyone tracking that rider's active orders.
 *
 * Updates are throttled so a moving rider does not hammer the API: a position
 * is sent when they have moved far enough, or when the heartbeat interval has
 * elapsed, but never more often than `minGapMs`.
 */
const useLiveLocation = (
  enabled,
  { minDistance = 30, heartbeatMs = 20000, minGapMs = 5000 } = {}
) => {
  const dispatch = useDispatch();

  const [position, setPosition] = useState(null);
  const [error, setError] = useState("");

  const lastSent = useRef({ at: 0, point: null });

  useEffect(() => {
    if (!enabled) return;

    lastSent.current = { at: 0, point: null };

    const stop = watchPosition(
      (point) => {
        setPosition(point);

        // A fresh fix means whatever failed earlier is no longer true.
        setError("");

        const now = Date.now();
        const { at, point: previous } = lastSent.current;

        // Never send more often than minGapMs.
        if (now - at < minGapMs) return;

        const movedEnough =
          !previous || haversineDistance(previous, point) >= minDistance;
        const heartbeatDue = now - at >= heartbeatMs;

        if (!movedEnough && !heartbeatDue) return;

        lastSent.current = { at: now, point };

        dispatch(
          updateMyLocationThunk({
            latitude: point.latitude,
            longitude: point.longitude,
          })
        );
      },
      (err) => setError(err.message)
    );

    return stop;
  }, [enabled, dispatch, minDistance, heartbeatMs, minGapMs]);

  return {
    position,
    // Sharing is off, so any earlier failure is no longer worth reporting.
    error: enabled ? error : "",
    isSharing: Boolean(enabled && position),
  };
};

export default useLiveLocation;
