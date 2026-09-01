/**
 * timeAgo
 * -------
 * Turns a timestamp into a short "how long ago" label, used wherever the UI
 * shows how fresh a rider's GPS position is.
 */
const timeAgo = (value) => {
  if (!value) return null;

  const seconds = Math.floor((Date.now() - new Date(value).getTime()) / 1000);

  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hr ago`;

  return new Date(value).toLocaleDateString([], {
    month: "short",
    day: "numeric",
  });
};

export default timeAgo;
