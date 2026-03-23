// src/services/locationApi.js

// Get Prayer times (Diyanet method = 13)
export const getPrayerTimes = async (city, district) => {
  try {
    const url = `https://api.aladhan.com/v1/timingsByCity?city=${encodeURIComponent(district)}&country=Turkey&state=${encodeURIComponent(city)}&method=13`;
    const res = await fetch(url);
    const json = await res.json();
    if (json && json.data) {
      return json.data.timings; 
    }
    return null;
  } catch (error) {
    console.error("Error fetching prayer times:", error);
    return null;
  }
};

// OpenStreetMap Nominatim Geocoding
export const getCoordinates = async (city, district) => {
  try {
    const query = `${district}, ${city}, Turkey`;
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`;
    const res = await fetch(url, { headers: { 'User-Agent': 'VisalQuranApp/1.0' } });
    const json = await res.json();
    if (json && json.length > 0) {
      return { 
        lat: parseFloat(json[0].lat), 
        lon: parseFloat(json[0].lon) 
      };
    }
    return null;
  } catch (error) {
    console.error("Error fetching coordinates:", error);
    return null;
  }
};

// OpenStreetMap Overpass (Mosques)
export const getNearbyMosques = async (lat, lon, radius = 5000) => {
  try {
    // We request nodes, ways, and relations that are muslim places of worship (mosques).
    // Using out center to get a single point for ways and relations.
    const overpassQuery = `
      [out:json];
      (
        node["amenity"="place_of_worship"]["religion"="muslim"](around:${radius},${lat},${lon});
        way["amenity"="place_of_worship"]["religion"="muslim"](around:${radius},${lat},${lon});
        relation["amenity"="place_of_worship"]["religion"="muslim"](around:${radius},${lat},${lon});
      );
      out center 30;
    `;
    const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(overpassQuery)}`;
    const res = await fetch(url);
    const json = await res.json();
    if (json && json.elements) {
      return json.elements.map(el => {
        const eLat = el.lat || (el.center ? el.center.lat : 0);
        const eLon = el.lon || (el.center ? el.center.lon : 0);
        const dist = getDistanceFromLatLonInKm(lat, lon, eLat, eLon);
        return {
          id: el.id,
          name: el.tags?.name || 'Bilinmeyen Cami (İsimsiz)',
          lat: eLat,
          lon: eLon,
          distance: dist
        };
      }).sort((a,b) => a.distance - b.distance);
    }
    return [];
  } catch (error) {
    console.error("Error fetching mosques:", error);
    return [];
  }
};

function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
  var R = 6371; // km
  var dLat = deg2rad(lat2-lat1);
  var dLon = deg2rad(lon2-lon1); 
  var a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2); 
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  return R * c; 
}

function deg2rad(deg) {
  return deg * (Math.PI/180);
}
