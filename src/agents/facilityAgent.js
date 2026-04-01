const EARTH_RADIUS_KM = 6371
const FALLBACK_LOCATION = { lat: 28.6139, lng: 77.2090 }

function toRadians(deg) {
  return (deg * Math.PI) / 180
}

function haversineDistanceKm(lat1, lng1, lat2, lng2) {
  const dLat = toRadians(lat2 - lat1)
  const dLng = toRadians(lng2 - lng1)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLng / 2) ** 2
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return EARTH_RADIUS_KM * c
}

const INDIAN_MATERNITY_HOSPITALS = [
  { name: 'AIIMS New Delhi', state: 'Delhi', district: 'New Delhi', lat: 28.5672, lng: 77.21, phone: '+91-11-26588500', hasICU: true, hasBloodBank: true, beds: 2478 },
  { name: 'Safdarjung Hospital', state: 'Delhi', district: 'New Delhi', lat: 28.5682, lng: 77.2058, phone: '+91-11-26730000', hasICU: true, hasBloodBank: true, beds: 1531 },
  { name: 'Lok Nayak Hospital', state: 'Delhi', district: 'New Delhi', lat: 28.6437, lng: 77.2279, phone: '+91-11-23232400', hasICU: true, hasBloodBank: true, beds: 1676 },
  { name: 'Nowrosjee Wadia Maternity Hospital', state: 'Maharashtra', district: 'Mumbai', lat: 18.9953, lng: 72.8417, phone: '+91-22-24129786', hasICU: true, hasBloodBank: true, beds: 450 },
  { name: 'KEM Hospital Mumbai', state: 'Maharashtra', district: 'Mumbai', lat: 18.9986, lng: 72.8418, phone: '+91-22-24107000', hasICU: true, hasBloodBank: true, beds: 1800 },
  { name: 'Breach Candy Hospital', state: 'Maharashtra', district: 'Mumbai', lat: 18.9682, lng: 72.8037, phone: '+91-22-23671888', hasICU: true, hasBloodBank: true, beds: 275 },
  { name: 'Institute of Obstetrics and Gynecology', state: 'Tamil Nadu', district: 'Chennai', lat: 13.0829, lng: 80.2773, phone: '+91-44-25305000', hasICU: true, hasBloodBank: true, beds: 1000 },
  { name: 'Apollo Womens Hospital Chennai', state: 'Tamil Nadu', district: 'Chennai', lat: 13.0702, lng: 80.2419, phone: '+91-44-28293333', hasICU: true, hasBloodBank: true, beds: 300 },
  { name: 'Cloudnine Hospital Chennai', state: 'Tamil Nadu', district: 'Chennai', lat: 13.0618, lng: 80.2496, phone: '+91-80-44671111', hasICU: true, hasBloodBank: false, beds: 180 },
  { name: 'AMRI Hospital Dhakuria', state: 'West Bengal', district: 'Kolkata', lat: 22.5159, lng: 88.3647, phone: '+91-33-66266600', hasICU: true, hasBloodBank: true, beds: 400 },
  { name: 'Sishu Mangal Hospital', state: 'West Bengal', district: 'Kolkata', lat: 22.5249, lng: 88.3524, phone: '+91-33-24753535', hasICU: true, hasBloodBank: true, beds: 550 },
  { name: 'Cloudnine Hospital Bangalore', state: 'Karnataka', district: 'Bengaluru', lat: 12.9249, lng: 77.5938, phone: '+91-80-44671111', hasICU: true, hasBloodBank: false, beds: 220 },
  { name: 'St Johns Medical College Hospital', state: 'Karnataka', district: 'Bengaluru', lat: 12.9345, lng: 77.62, phone: '+91-80-22065000', hasICU: true, hasBloodBank: true, beds: 1350 },
  { name: 'Fernandez Hospital', state: 'Telangana', district: 'Hyderabad', lat: 17.4016, lng: 78.4867, phone: '+91-40-40222397', hasICU: true, hasBloodBank: true, beds: 350 },
  { name: 'Apollo Cradle Jubilee Hills', state: 'Telangana', district: 'Hyderabad', lat: 17.4322, lng: 78.4071, phone: '+91-40-49177777', hasICU: true, hasBloodBank: false, beds: 200 },
  { name: 'Ruby Hall Clinic', state: 'Maharashtra', district: 'Pune', lat: 18.5362, lng: 73.8885, phone: '+91-20-66455100', hasICU: true, hasBloodBank: true, beds: 600 },
  { name: 'Deenanath Mangeshkar Hospital', state: 'Maharashtra', district: 'Pune', lat: 18.5089, lng: 73.8077, phone: '+91-20-40151000', hasICU: true, hasBloodBank: true, beds: 800 },
  { name: 'SMS Hospital Jaipur', state: 'Rajasthan', district: 'Jaipur', lat: 26.9012, lng: 75.8076, phone: '+91-141-2518380', hasICU: true, hasBloodBank: true, beds: 2000 },
  { name: 'King Georges Medical University', state: 'Uttar Pradesh', district: 'Lucknow', lat: 26.8695, lng: 80.9346, phone: '+91-522-2257540', hasICU: true, hasBloodBank: true, beds: 2200 },
  { name: 'Civil Hospital Ahmedabad', state: 'Gujarat', district: 'Ahmedabad', lat: 23.0537, lng: 72.6044, phone: '+91-79-22683721', hasICU: true, hasBloodBank: true, beds: 2000 }
]

function getBrowserLocation() {
  return new Promise((resolve) => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      resolve(FALLBACK_LOCATION)
      return
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({ lat: position.coords.latitude, lng: position.coords.longitude })
      },
      () => resolve(FALLBACK_LOCATION),
      { enableHighAccuracy: true, timeout: 10000 }
    )
  })
}

export async function findNearestFacility() {
  const { lat: userLat, lng: userLng } = await getBrowserLocation()
  return INDIAN_MATERNITY_HOSPITALS.map((hospital) => {
    const distanceKm = haversineDistanceKm(userLat, userLng, hospital.lat, hospital.lng)
    return {
      ...hospital,
      distance: `${distanceKm.toFixed(1)} km`
    }
  })
    .sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance))
    .slice(0, 3)
}

