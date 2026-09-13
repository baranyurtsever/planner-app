import { safeExternalUrl } from '../domain/place'

export function PlaceDetails({ location, compact = false }) {
  if (!location?.name && !location?.address) return null
  const phoneHref = location.phone ? `tel:${location.phone.replace(/[^+\d]/g, '')}` : ''
  const mapUrl = safeExternalUrl(location.mapUrl)
  const website = safeExternalUrl(location.website)
  return (
    <div className={compact ? 'text-xs' : 'text-sm'}>
      {location.name && <p className="font-bold text-teal-800">📍 {location.name}</p>}
      {location.address && location.address !== location.name && <p className="mt-1 text-slate-500">{location.address}</p>}
      {location.openingHours && <p className="mt-1 text-slate-600">🕒 {location.openingHours}</p>}
      <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 font-bold text-teal-700">
        {mapUrl && <a href={mapUrl} target="_blank" rel="noreferrer">Haritada aç ↗</a>}
        {website && <a href={website} target="_blank" rel="noreferrer">Web sitesi ↗</a>}
        {phoneHref && <a href={phoneHref}>Ara: {location.phone}</a>}
      </div>
    </div>
  )
}
