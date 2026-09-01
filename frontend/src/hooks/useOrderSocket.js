import { useEffect, useRef } from "react";
import { useDispatch } from "react-redux";

import { getSocket, joinOrderRoom, leaveOrderRoom } from "../utils/socket";
import {
  liveStatusUpdated,
  liveRiderLocationUpdated,
  liveRiderAssignmentUpdated,
} from "../redux/order/orderSlice";

/**
 * Subscribe to live updates for a single order.
 *
 * Joins the order's Socket.IO room and forwards every event straight into the
 * order slice, so any component reading `order.tracking` or `order.currentOrder`
 * re-renders on its own. Pass `onEvent` if a page also needs to react locally
 * (for example to show a toast).
 */
const useOrderSocket = (orderId, onEvent) => {
  const dispatch = useDispatch();
  const callbackRef = useRef(onEvent);

  // Kept in a ref so a page can pass an inline callback without the socket
  // listeners being torn down and re-attached on every render.
  useEffect(() => {
    callbackRef.current = onEvent;
  }, [onEvent]);

  useEffect(() => {
    if (!orderId) return;

    const socket = getSocket();

    joinOrderRoom(orderId);

    // Re-join after a dropped connection, otherwise the room is lost.
    const handleConnect = () => joinOrderRoom(orderId);

    const handleStatus = (payload) => {
      dispatch(liveStatusUpdated(payload));
      callbackRef.current?.("order:status", payload);
    };

    const handleRiderLocation = (payload) => {
      dispatch(liveRiderLocationUpdated(payload));
      callbackRef.current?.("rider:location", payload);
    };

    const handleRiderAssigned = (payload) => {
      dispatch(liveRiderAssignmentUpdated(payload));
      callbackRef.current?.("order:rider-assigned", payload);
    };

    const handleRiderResponse = (payload) => {
      dispatch(liveRiderAssignmentUpdated(payload));
      callbackRef.current?.("order:rider-response", payload);
    };

    socket.on("connect", handleConnect);
    socket.on("order:status", handleStatus);
    socket.on("rider:location", handleRiderLocation);
    socket.on("order:rider-assigned", handleRiderAssigned);
    socket.on("order:rider-response", handleRiderResponse);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("order:status", handleStatus);
      socket.off("rider:location", handleRiderLocation);
      socket.off("order:rider-assigned", handleRiderAssigned);
      socket.off("order:rider-response", handleRiderResponse);
      leaveOrderRoom(orderId);
    };
  }, [orderId, dispatch]);
};

export default useOrderSocket;
