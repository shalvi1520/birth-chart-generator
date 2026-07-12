const GEOAPIFY_URL = "https://api.geoapify.com/v1/geocode/autocomplete";


const cache = new Map();

function formatResult(item) {
  const { lat, lon, city, state, country, formatted, name } = item;

  return {
    latitude: lat,
    longitude: lon,
    displayName: formatted,
    city: city || name || null,
    state: state || null,
    country: country || null,
  };
}

export async function searchLocations(query, limit = 8) {
  if (!query || query.trim().length < 2) return [];

  const cacheKey = `${query.trim().toLowerCase()}:${limit}`;
  if (cache.has(cacheKey)) return cache.get(cacheKey);

  const apiKey = process.env.GEOAPIFY_API_KEY;
  if (!apiKey) {
    throw new Error("Geocoding is not configured (missing GEOAPIFY_API_KEY).");
  }

  const url = `${GEOAPIFY_URL}?text=${encodeURIComponent(query)}&type=city&limit=${limit}&format=json&apiKey=${apiKey}`;
  const res = await fetch(url);

  if (!res.ok) {
    throw new Error(`Geocoding service returned an error (status ${res.status})`);
  }

  const data = await res.json();
  const results = (data.results || []).map(formatResult);

  cache.set(cacheKey, results);
  return results;
}


export async function geocodeLocation(query) {
  const [best] = await searchLocations(query, 1);
  if (!best) {
    throw new Error("Location not found. Try a more specific or different city name.");
  }
  return best;
}