import { useSyncExternalStore } from "react";

const QUERY = "(max-width: 640px)";

const subscribe = (onChange) => {
  const query = window.matchMedia(QUERY);

  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
};

const getSnapshot = () => window.matchMedia(QUERY).matches;

/**
 * True on phone-width screens.
 *
 * The horizontal bar charts need a narrower category axis and shorter value
 * labels there: a desktop-sized axis plus a full "Rs 1,875,430" label eats a
 * 375px card and leaves the bars about 25px long, which is unreadable.
 */
const useIsNarrow = () =>
  useSyncExternalStore(subscribe, getSnapshot, () => false);

export default useIsNarrow;
