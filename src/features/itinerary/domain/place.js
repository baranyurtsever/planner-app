export function safeExternalUrl(value) {
  if (!value) return ''
  try {
    const url = new URL(value)
    return ['http:', 'https:'].includes(url.protocol) ? url.toString() : ''
  } catch {
    return ''
  }
}

function osmObjectUrl(osmType, osmId, lat, lng) {
  const types = { node: 'node', way: 'way', relation: 'relation' }
  if (types[osmType] && osmId) return `https://www.openstreetmap.org/${types[osmType]}/${osmId}`
  return Number.isFinite(lat) && Number.isFinite(lng)
    ? `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=17/${lat}/${lng}`
    : ''
}

export function normalizePlaceSearchResult(result) {
  const lat = Number(result?.lat)
  const lng = Number(result?.lon)
  const displayName = String(result?.display_name || '').trim()
  const name = String(result?.name || displayName.split(',')[0] || '').trim()
  const extras = result?.extratags || {}
  return {
    id: `${result?.osm_type || 'place'}-${result?.osm_id || result?.place_id || `${lat}-${lng}`}`,
    name,
    address: displayName,
    lat: Number.isFinite(lat) ? lat : null,
    lng: Number.isFinite(lng) ? lng : null,
    mapUrl: osmObjectUrl(result?.osm_type, result?.osm_id, lat, lng),
    website: safeExternalUrl(extras.website || extras.contact_website || extras['contact:website']),
    phone: String(extras.phone || extras.contact_phone || extras['contact:phone'] || '').trim(),
    openingHours: String(extras.opening_hours || '').trim(),
    category: String(result?.type || result?.category || '').trim(),
  }
}

export function normalizePlanLocation(planItem) {
  const source = planItem.location || {}
  const lat = Number(planItem.locationLat ?? source.lat)
  const lng = Number(planItem.locationLng ?? source.lng)
  const hasCoordinates =
    (planItem.locationLat ?? source.lat ?? '') !== '' &&
    (planItem.locationLng ?? source.lng ?? '') !== ''
  return {
    name: String(planItem.locationName ?? source.name ?? '').trim(),
    address: String(planItem.locationAddress ?? source.address ?? '').trim(),
    mapUrl: safeExternalUrl(planItem.mapUrl ?? source.mapUrl),
    lat: hasCoordinates && Number.isFinite(lat) ? lat : null,
    lng: hasCoordinates && Number.isFinite(lng) ? lng : null,
    website: safeExternalUrl(planItem.locationWebsite ?? source.website),
    phone: String(planItem.locationPhone ?? source.phone ?? '').trim(),
    openingHours: String(planItem.locationOpeningHours ?? source.openingHours ?? '').trim(),
    category: String(planItem.locationCategory ?? source.category ?? '').trim(),
  }
}
