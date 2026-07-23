import { useEffect, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { ErrorMessage } from '../../../shared/components/Feedback'
import {
  saveTripSetting,
  subscribeToTripSetting,
} from '../data/tripSettingRepository'

const emptySetting = { preferredCurrency: 'TRY', dailyBudget: '', privateNotes: '' }

export function TripSettingsPage() {
  const { trip, user } = useOutletContext()
  const [setting, setSetting] = useState(emptySetting)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(
    () => subscribeToTripSetting(
      trip.id,
      user.uid,
      (nextSetting) => setSetting(nextSetting || emptySetting),
      (subscriptionError) => setError(subscriptionError.message),
    ),
    [trip.id, user.uid],
  )

  async function submit(event) {
    event.preventDefault()
    setError('')
    setMessage('')
    try {
      await saveTripSetting(trip.id, user.uid, setting)
      setMessage('Kişisel gezi ayarların kaydedildi.')
    } catch (saveError) {
      setError(saveError.message)
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <p className="text-xs font-bold uppercase tracking-[0.22em] text-teal-700">Yalnızca sana ait</p>
      <h2 className="mt-2 text-3xl font-black">Gezi Ayarları</h2>
      <form onSubmit={submit} className="mt-6 grid gap-4 rounded-2xl border border-slate-200 bg-white p-6 sm:grid-cols-2">
        <label className="text-sm font-semibold text-slate-600">
          Tercih edilen para birimi
          <input
            required
            aria-label="Tercih edilen para birimi"
            value={setting.preferredCurrency}
            onChange={(event) => setSetting({ ...setting, preferredCurrency: event.target.value })}
            className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3"
          />
        </label>
        <label className="text-sm font-semibold text-slate-600">
          Günlük bütçe
          <input
            min="0"
            step="0.01"
            type="number"
            aria-label="Günlük bütçe"
            value={setting.dailyBudget}
            onChange={(event) => setSetting({ ...setting, dailyBudget: event.target.value })}
            className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3"
          />
        </label>
        <label className="text-sm font-semibold text-slate-600 sm:col-span-2">
          Kişisel not
          <textarea
            aria-label="Kişisel gezi notu"
            value={setting.privateNotes}
            onChange={(event) => setSetting({ ...setting, privateNotes: event.target.value })}
            className="mt-1 min-h-32 w-full rounded-xl border border-slate-200 px-4 py-3"
          />
        </label>
        <button className="rounded-xl bg-slate-900 px-5 py-3 font-bold text-white sm:col-span-2">
          Ayarları kaydet
        </button>
      </form>
      {message && <p className="mt-4 text-sm font-semibold text-teal-700">{message}</p>}
      <div className="mt-4"><ErrorMessage message={error} /></div>
    </div>
  )
}
