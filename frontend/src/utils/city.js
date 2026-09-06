/**
 * City resolution
 * ---------------
 * OpenStreetMap tags Pakistani places with their *administrative* names, not
 * the city name a customer would recognise. A single pin dropped in DHA Lahore
 * comes back as:
 *
 *   { village: "Chung Khurad", subdistrict: "Lahore Cantonment Tehsil",
 *     county: "Lahore District", state: "Punjab" }
 *
 * Reading any one field gives the wrong answer — "Chung Khurad", "Karachi
 * Division" or "Faisalabad City Tehsil" instead of Lahore, Karachi and
 * Faisalabad. This module turns those raw tags into the real city name.
 */

/**
 * Administrative words OSM appends to a city name.
 * Stripped from the end, longest phrases first, until nothing changes:
 * "Lahore Cantonment Tehsil" → "Lahore", "Faisalabad City Tehsil" → "Faisalabad".
 *
 * Deliberately excludes "Town" — Pakistani union councils are named "Saddar
 * Town", "Model Town", "Bahria Town", and cutting the word there leaves a
 * fragment rather than a city.
 */
const ADMIN_SUFFIX_WORDS = [
  "capital territory",
  "metropolitan corporation",
  "municipal corporation",
  "municipal committee",
  "town committee",
  "development authority",
  "union council",
  "sub-division",
  "sub division",
  "subdivision",
  "cantonment",
  "cantt.",
  "cantt",
  "municipality",
  "district",
  "division",
  "tehsil",
  "tahsil",
  "taluka",
  "taluqa",
  "city",
];

/**
 * The handful of those words that also show up in front of the name
 * ("Tehsil Sahiwal", "District Okara").
 *
 * Kept separate from the suffix list because a leading word is usually part of
 * the real name — stripping "city" here would turn "City of Westminster" into
 * "of Westminster".
 */
const ADMIN_PREFIX_WORDS = [
  "sub-division",
  "sub division",
  "subdivision",
  "municipality",
  "district",
  "division",
  "tehsil",
  "tahsil",
  "taluka",
  "taluqa",
];

/**
 * Pakistani cities, in the spelling OSM uses.
 *
 * Used only to *promote* a candidate that is already present in the geocoder
 * response — never to invent a name. Because every Pakistani district is named
 * after its principal city, stripping "District" off `county` almost always
 * lands on an entry here, which is what rescues pins in housing societies and
 * villages on a city's edge.
 */
const KNOWN_CITIES = [
  // Sindh
  "Karachi", "Hyderabad", "Sukkur", "Larkana", "Nawabshah", "Mirpur Khas",
  "Shikarpur", "Jacobabad", "Khairpur", "Dadu", "Thatta", "Badin", "Sanghar",
  "Ghotki", "Umerkot", "Kandhkot", "Shahdadkot", "Tando Adam", "Tando Allahyar",
  "Tando Muhammad Khan", "Naushahro Feroze", "Matiari", "Jamshoro", "Kotri",
  "Kashmore", "Qambar", "Sujawal", "Malir", "Korangi", "Keamari",

  // Punjab
  "Lahore", "Faisalabad", "Rawalpindi", "Gujranwala", "Multan", "Bahawalpur",
  "Sargodha", "Sialkot", "Sheikhupura", "Rahim Yar Khan", "Jhang", "Gujrat",
  "Sahiwal", "Kasur", "Okara", "Chiniot", "Kamoke", "Hafizabad", "Sadiqabad",
  "Burewala", "Khanewal", "Muzaffargarh", "Mandi Bahauddin", "Jhelum",
  "Khanpur", "Pakpattan", "Daska", "Gojra", "Bahawalnagar", "Muridke",
  "Bhalwal", "Attock", "Vehari", "Ferozwala", "Chichawatni", "Kamalia",
  "Kot Addu", "Kot Adu", "Mianwali", "Khushab", "Wazirabad", "Layyah",
  "Chakwal", "Lodhran", "Bhakkar", "Toba Tek Singh", "Haroonabad", "Rajanpur",
  "Narowal", "Nankana Sahib", "Jaranwala", "Sambrial", "Pasrur", "Kabirwala",
  "Mailsi", "Arifwala", "Sarai Alamgir", "Kharian", "Hasilpur", "Bhera",
  "Dera Ghazi Khan", "Wah", "Taxila", "Gujar Khan", "Murree", "Talagang",
  "Shorkot", "Depalpur", "Renala Khurd", "Jalalpur Jattan", "Shakargarh",
  "Ahmadpur East", "Ahmedpur East", "Liaquatpur", "Fort Abbas", "Chunian",
  "Pattoki", "Raiwind", "Shahkot", "Sillanwali", "Bhawana", "Pindi Bhattian",

  // Islamabad Capital Territory
  "Islamabad",

  // Khyber Pakhtunkhwa
  "Peshawar", "Mardan", "Mingora", "Kohat", "Abbottabad", "Swabi", "Nowshera",
  "Charsadda", "Bannu", "Haripur", "Mansehra", "Timergara", "Batkhela",
  "Chitral", "Karak", "Hangu", "Lakki Marwat", "Tank", "Dera Ismail Khan",
  "Swat", "Buner", "Shangla", "Dir", "Malakand", "Bajaur", "Khyber", "Kurram",
  "Battagram", "Torghar", "Kohistan", "Chakdara", "Takht Bhai", "Pabbi",

  // Balochistan
  "Quetta", "Turbat", "Khuzdar", "Hub", "Chaman", "Gwadar", "Zhob", "Loralai",
  "Sibi", "Dera Murad Jamali", "Dera Allahyar", "Usta Mohammad", "Pishin",
  "Mastung", "Kalat", "Nushki", "Panjgur", "Kharan", "Lasbela", "Jaffarabad",

  // Gilgit-Baltistan & Azad Kashmir
  "Gilgit", "Skardu", "Hunza", "Chilas", "Ghizer", "Astore", "Muzaffarabad",
  "Mirpur", "Kotli", "Bagh", "Rawalakot", "Bhimber", "Neelum",
];

const KNOWN_CITY_LOOKUP = new Map(
  KNOWN_CITIES.map((name) => [name.toLowerCase(), name])
);

/**
 * Address fields that can carry a city name, best first.
 *
 * `county` / `district` sit ahead of `village` and `suburb` on purpose: a pin
 * inside a city's outskirts is tagged with the tiny locality it sits in, while
 * the district still carries the city name.
 */
const CITY_FIELDS = [
  "city",
  "town",
  "municipality",
  "city_district",
  "county",
  "district",
  "state_district",
  "subdistrict",
  "village",
  "suburb",
  "state",
];

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** Strip OSM's administrative words off a place name. */
export const cleanCityName = (raw) => {
  if (!raw || typeof raw !== "string") return "";

  let name = raw.trim().replace(/\s+/g, " ");
  let changed = true;

  // Never strip a name down to nothing — some places really are called
  // "Cantt" or "City".
  const apply = (pattern) => {
    const next = name.replace(pattern, "").trim();

    if (next !== name && next.length >= 3) {
      name = next;
      changed = true;
    }
  };

  while (changed) {
    changed = false;

    for (const word of ADMIN_SUFFIX_WORDS) {
      apply(new RegExp(`[\\s,-]+${escapeRegex(word)}$`, "i"));
    }

    for (const word of ADMIN_PREFIX_WORDS) {
      apply(new RegExp(`^${escapeRegex(word)}[\\s,-]+`, "i"));
    }
  }

  return name;
};

/** True when `raw` is a Pakistani city once its admin suffixes are removed. */
export const matchKnownCity = (raw) =>
  KNOWN_CITY_LOOKUP.get(cleanCityName(raw).toLowerCase()) || "";

/**
 * Pull the city out of a Nominatim `address` object.
 *
 * Two passes over the same candidates:
 *   1. the first one that resolves to a city we know — this is what turns
 *      "Lahore District" into Lahore and "Islamabad Capital Territory" into
 *      Islamabad;
 *   2. otherwise the first non-empty candidate, cleaned — so small towns and
 *      addresses outside Pakistan still get a sensible answer.
 *
 * Returns "" when the response carries nothing usable.
 */
export const resolveCity = (details = {}) => {
  const candidates = CITY_FIELDS.map((field) => details?.[field]).filter(
    (value) => typeof value === "string" && value.trim()
  );

  for (const candidate of candidates) {
    const known = matchKnownCity(candidate);
    if (known) return known;
  }

  for (const candidate of candidates) {
    const cleaned = cleanCityName(candidate);
    if (cleaned) return cleaned;
  }

  return "";
};

export default resolveCity;
