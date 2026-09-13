export function hasValidCoordinates(location) {
  return [location?.lat, location?.lng].every((value) =>
    value !== null && value !== undefined && String(value).trim() !== '' && Number.isFinite(Number(value)),
  ) && Math.abs(Number(location.lat)) <= 90 && Math.abs(Number(location.lng)) <= 180
}
