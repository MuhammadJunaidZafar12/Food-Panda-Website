import L from "leaflet";

/**
 * Leaflet's default marker images break when bundled by Vite, so every marker
 * in the app uses a `divIcon` built from inline SVG instead. No image assets,
 * no broken pins, and the colours match the app's palette.
 */

const pinSvg = (color, glyph) => `
  <div style="position:relative;width:34px;height:44px;">
    <svg width="34" height="44" viewBox="0 0 34 44" xmlns="http://www.w3.org/2000/svg">
      <path d="M17 0C7.6 0 0 7.6 0 17c0 12 17 27 17 27s17-15 17-27c0-9.4-7.6-17-17-17z"
            fill="${color}" stroke="#ffffff" stroke-width="2"/>
      <circle cx="17" cy="16.5" r="10" fill="#ffffff"/>
    </svg>
    <div style="position:absolute;top:6px;left:0;width:34px;height:21px;
                display:flex;align-items:center;justify-content:center;
                font-size:13px;line-height:1;">${glyph}</div>
  </div>
`;

const createPin = (color, glyph) =>
  L.divIcon({
    html: pinSvg(color, glyph),
    className: "",
    iconSize: [34, 44],
    iconAnchor: [17, 44],
    popupAnchor: [0, -42],
  });

// Restaurant — where the food is cooked.
export const restaurantIcon = createPin("#f97316", "🍽️");

// Customer — where the food is going.
export const customerIcon = createPin("#16a34a", "🏠");

// Generic pin for the LocationPicker.
export const pickerIcon = createPin("#e21b70", "📍");

// User destination pin
export const userDestinationIcon = createPin("#e21b70", "📍");

/**
 * Rider marker — a pulsing dot rather than a pin, because it moves.
 */
export const riderIcon = L.divIcon({
  html: `
    <div style="position:relative;width:38px;height:38px;">
      <span style="position:absolute;inset:0;border-radius:9999px;
                   background:rgba(226,27,112,.35);
                   animation:fp-rider-pulse 1.8s ease-out infinite;"></span>
      <div style="position:absolute;top:5px;left:5px;width:28px;height:28px;
                  border-radius:9999px;background:#e21b70;border:2px solid #fff;
                  box-shadow:0 2px 6px rgba(0,0,0,.3);
                  display:flex;align-items:center;justify-content:center;
                  font-size:14px;line-height:1;">🛵</div>
    </div>
    <style>
      @keyframes fp-rider-pulse {
        0%   { transform: scale(.6); opacity: .9; }
        100% { transform: scale(1.6); opacity: 0; }
      }
    </style>
  `,
  className: "",
  iconSize: [38, 38],
  iconAnchor: [19, 19],
  popupAnchor: [0, -18],
});
