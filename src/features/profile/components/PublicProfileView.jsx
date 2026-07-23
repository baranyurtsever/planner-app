export function PublicProfileView({ profile, trips }) {
  return (
    <section>
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex items-center gap-5">
          <div className="grid h-20 w-20 place-items-center rounded-2xl bg-teal-700 text-2xl font-bold text-white">
            {profile.displayName?.slice(0, 1).toUpperCase() || 'P'}
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">{profile.displayName}</h1>
            <p className="mt-1 text-sm font-medium text-teal-700">@{profile.username}</p>
            {profile.bio && <p className="mt-3 max-w-2xl text-slate-600">{profile.bio}</p>}
          </div>
        </div>
      </div>

      <div className="mt-8">
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-teal-700">Herkese açık</p>
        <h2 className="mt-2 text-2xl font-bold text-slate-900">Geziler</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {trips.map((trip) => (
            <a
              key={trip.id}
              href={`/u/${profile.username}/trips/${trip.id}`}
              className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-teal-300 hover:shadow-md"
            >
              <span className="text-lg font-bold text-slate-900 group-hover:text-teal-800">
                {trip.name}
              </span>
              <p className="mt-1 text-sm text-slate-500">{trip.locationName || 'Konum eklenmedi'}</p>
            </a>
          ))}
          {!trips.length && (
            <p className="rounded-2xl border border-dashed border-slate-300 p-6 text-slate-500">
              Henüz herkese açık Gezi yok.
            </p>
          )}
        </div>
      </div>
    </section>
  )
}
