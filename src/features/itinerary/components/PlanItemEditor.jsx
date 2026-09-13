import { useEffect, useMemo, useRef, useState } from 'react'
import { tripRole, TRIP_ROLES } from '../../../shared/domain/access'
import { ErrorMessage } from '../../../shared/components/Feedback'
import {
  createDateOnlyPlanTime,
  createTimedPlanTime,
  utcToZonedLocal,
  zonedLocalToUtc,
} from '../domain/planTime'
import { PLAN_CATEGORIES, PLAN_SCOPES, PLAN_STATUSES } from '../domain/planItem'
import { createTimeZoneOptions } from '../domain/timeZones'
import { savePlanItem } from '../data/planRepository'
import { PlanParticipationSection } from './PlanParticipationSection'

const localTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone

function timeZoneReferenceDate(localDateTime) {
  const localDate = localDateTime?.slice(0, 10)
  return /^\d{4}-\d{2}-\d{2}$/.test(localDate)
    ? new Date(`${localDate}T12:00:00.000Z`)
    : new Date()
}

function toLocalDateTime(localDate, minute) {
  const [year, month, day] = localDate.split('-').map(Number)
  return new Date(Date.UTC(year, month - 1, day, 0, minute)).toISOString().slice(0, 16)
}

function initialForm(item, initialSlot, userId) {
  if (item) {
    const dateOnly = item.time.kind === 'date'
    return {
      id: item.id,
      scope: item.scope || PLAN_SCOPES.SHARED,
      ownerId: item.ownerId || '',
      title: item.title,
      category: item.category,
      status: item.status || PLAN_STATUSES.TODO,
      visibility: item.visibility,
      notes: item.notes || '',
      dateOnly,
      localDate: dateOnly ? item.time.localDate : '',
      startsAtLocal: dateOnly ? '' : utcToZonedLocal(item.time.startsAt, item.time.startTimeZone),
      endsAtLocal: dateOnly ? '' : utcToZonedLocal(item.time.endsAt, item.time.endTimeZone),
      startTimeZone: dateOnly ? localTimeZone : item.time.startTimeZone,
      endTimeZone: dateOnly ? localTimeZone : item.time.endTimeZone,
      locationName: item.location?.name || '',
      locationLat: item.location?.lat ?? '',
      locationLng: item.location?.lng ?? '',
      mapUrl: item.location?.mapUrl || '',
      participantIds: item.participantIds || [],
      excludedParticipantIds: item.excludedParticipantIds || [],
      blockedParticipantIds: item.blockedParticipantIds || [],
    }
  }

  const localDate = initialSlot?.localDate || new Date().toISOString().slice(0, 10)
  const startMinute = initialSlot?.startMinute ?? 9 * 60
  return {
    scope: PLAN_SCOPES.PERSONAL,
    ownerId: userId,
    title: '',
    category: 'activity',
    status: PLAN_STATUSES.TODO,
    visibility: 'trip',
    notes: '',
    dateOnly: Boolean(initialSlot?.dateOnly),
    localDate,
    startsAtLocal: toLocalDateTime(localDate, startMinute),
    endsAtLocal: toLocalDateTime(localDate, startMinute + 60),
    startTimeZone: localTimeZone,
    endTimeZone: localTimeZone,
    locationName: '',
    locationLat: '',
    locationLng: '',
    mapUrl: '',
    participantIds: [userId],
    excludedParticipantIds: [],
    blockedParticipantIds: [],
  }
}

export function PlanItemEditor({
  trip,
  user,
  item = null,
  liveItem = item,
  initialSlot = null,
  readOnly = false,
  onClose,
  onSaved,
}) {
  const [form, setForm] = useState(() => initialForm(item, initialSlot, user.uid))
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const dialogRef = useRef(null)
  const role = tripRole(trip, user.uid)
  const canChooseShared = role === TRIP_ROLES.OWNER || role === TRIP_ROLES.EDITOR
  const effectiveReadOnly = readOnly
  const startTimeZoneDate = form.startsAtLocal?.slice(0, 10)
  const endTimeZoneDate = form.endsAtLocal?.slice(0, 10)
  const startTimeZoneOptions = useMemo(
    () => createTimeZoneOptions(timeZoneReferenceDate(startTimeZoneDate)),
    [startTimeZoneDate],
  )
  const endTimeZoneOptions = useMemo(
    () => createTimeZoneOptions(timeZoneReferenceDate(endTimeZoneDate)),
    [endTimeZoneDate],
  )
  const title = useMemo(() => {
    if (effectiveReadOnly) return 'Plan Öğesi'
    if (item) return form.scope === PLAN_SCOPES.SHARED ? 'Ortak Planı düzenle' : 'Kişisel Planı düzenle'
    return 'Yeni Plan Öğesi'
  }, [effectiveReadOnly, form.scope, item])

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return undefined
    const focusable = () => [...dialog.querySelectorAll('button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled])')]
    focusable()[0]?.focus()
    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        event.preventDefault()
        onClose()
        return
      }
      if (event.key !== 'Tab') return
      const elements = focusable()
      if (!elements.length) return
      const first = elements[0]
      const last = elements[elements.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }
    dialog.addEventListener('keydown', handleKeyDown)
    return () => dialog.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  async function submit(event) {
    event.preventDefault()
    setSaving(true)
    setError('')
    try {
      const time = form.dateOnly
        ? createDateOnlyPlanTime(form.localDate)
        : createTimedPlanTime({
            startsAt: zonedLocalToUtc(form.startsAtLocal, form.startTimeZone),
            endsAt: zonedLocalToUtc(form.endsAtLocal, form.endTimeZone),
            startTimeZone: form.startTimeZone,
            endTimeZone: form.endTimeZone,
          })
      const result = await savePlanItem(trip, { ...item, ...form, time, _original: item }, user.uid)
      onSaved?.(result)
      onClose()
    } catch (saveError) {
      setError(saveError.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 p-4 backdrop-blur-sm" onMouseDown={(event) => {
      if (event.target === event.currentTarget) onClose()
    }}>
      <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="plan-item-editor-title" className="max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-3xl bg-white shadow-2xl">
        <form id="plan-item-editor-form" onSubmit={submit}>
        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white/95 px-6 py-5 backdrop-blur">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-teal-700">{form.scope === PLAN_SCOPES.SHARED ? 'Ortak plan' : 'Kişisel plan'}</p>
            <h2 id="plan-item-editor-title" className="mt-1 text-2xl font-black">{title}</h2>
          </div>
          <button type="button" onClick={onClose} className="rounded-full px-3 py-2 text-slate-500 hover:bg-slate-100">✕</button>
        </header>

        <fieldset disabled={effectiveReadOnly || saving} className="grid gap-5 p-6 md:grid-cols-2">
          <label className="text-sm font-semibold text-slate-600">
            Plan türü
            <select
              aria-label="Plan türü"
              value={form.scope}
              onChange={(event) => {
                const scope = event.target.value
                setForm({
                  ...form,
                  scope,
                  visibility: scope === PLAN_SCOPES.SHARED && form.visibility === 'private' ? 'trip' : form.visibility,
                })
              }}
              className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3"
            >
              <option value={PLAN_SCOPES.PERSONAL}>Kişisel Plan Öğesi</option>
              {canChooseShared && <option value={PLAN_SCOPES.SHARED}>Ortak Plan Öğesi</option>}
            </select>
          </label>
          <label className="text-sm font-semibold text-slate-600">
            Başlık
            <input required value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3" />
          </label>
          <label className="text-sm font-semibold text-slate-600">
            Kart tipi
            <select value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3">
              {PLAN_CATEGORIES.map((category) => <option key={category.value} value={category.value}>{category.icon} {category.label}</option>)}
            </select>
          </label>
          <label className="text-sm font-semibold text-slate-600">
            Durum
            <select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })} className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3">
              <option value="todo">Yapılacak</option>
              <option value="done">Tamamlandı</option>
              <option value="postponed">Ertelendi</option>
              <option value="cancelled">İptal edildi</option>
            </select>
          </label>
          <label className="flex items-center gap-2 text-sm font-semibold md:col-span-2">
            <input type="checkbox" checked={form.dateOnly} onChange={(event) => setForm({ ...form, dateOnly: event.target.checked })} />
            Tüm gün / yalnızca tarih
          </label>
          {form.dateOnly ? (
            <label className="text-sm font-semibold text-slate-600">
              Tarih
              <input required type="date" value={form.localDate} onChange={(event) => setForm({ ...form, localDate: event.target.value })} className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3" />
            </label>
          ) : (
            <>
              <label className="text-sm font-semibold text-slate-600">Başlangıç<input required type="datetime-local" step="60" value={form.startsAtLocal} onChange={(event) => setForm({ ...form, startsAtLocal: event.target.value })} className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3" /></label>
              <label className="text-sm font-semibold text-slate-600">Bitiş<input required type="datetime-local" step="60" value={form.endsAtLocal} onChange={(event) => setForm({ ...form, endsAtLocal: event.target.value })} className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3" /></label>
              <label className="text-sm font-semibold text-slate-600">Başlangıç saat dilimi<select required aria-label="Başlangıç saat dilimi" value={form.startTimeZone} onChange={(event) => setForm({ ...form, startTimeZone: event.target.value })} className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3">{startTimeZoneOptions.map((timeZone) => <option key={timeZone.value} value={timeZone.value}>{timeZone.label}</option>)}</select></label>
              <label className="text-sm font-semibold text-slate-600">Bitiş saat dilimi<select required aria-label="Bitiş saat dilimi" value={form.endTimeZone} onChange={(event) => setForm({ ...form, endTimeZone: event.target.value })} className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3">{endTimeZoneOptions.map((timeZone) => <option key={timeZone.value} value={timeZone.value}>{timeZone.label}</option>)}</select></label>
            </>
          )}
          <label className="text-sm font-semibold text-slate-600">
            Görünürlük
            <select value={form.visibility} onChange={(event) => setForm({ ...form, visibility: event.target.value })} className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3">
              {form.scope === PLAN_SCOPES.PERSONAL && <option value="private">Yalnızca ben</option>}
              <option value="trip">Gezi katılımcıları</option>
              <option value="profile">Profilde herkese açık</option>
            </select>
          </label>
          <label className="text-sm font-semibold text-slate-600">Konum adı<input value={form.locationName} onChange={(event) => setForm({ ...form, locationName: event.target.value })} className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3" /></label>
          <label className="text-sm font-semibold text-slate-600">Harita bağlantısı<input type="url" value={form.mapUrl} onChange={(event) => setForm({ ...form, mapUrl: event.target.value })} className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3" /></label>
          <div className="grid grid-cols-2 gap-3">
            <label className="text-sm font-semibold text-slate-600">Enlem<input type="number" step="any" value={form.locationLat} onChange={(event) => setForm({ ...form, locationLat: event.target.value })} className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3" /></label>
            <label className="text-sm font-semibold text-slate-600">Boylam<input type="number" step="any" value={form.locationLng} onChange={(event) => setForm({ ...form, locationLng: event.target.value })} className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3" /></label>
          </div>
          <label className="text-sm font-semibold text-slate-600 md:col-span-2">Not<textarea value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} className="mt-1 min-h-28 w-full rounded-xl border border-slate-200 px-4 py-3" /></label>
        </fieldset>

          <div className="px-6"><ErrorMessage message={error} /></div>
        </form>
        {item && <PlanParticipationSection trip={trip} item={liveItem || item} user={user} />}
        <footer className="sticky bottom-0 flex justify-end gap-3 border-t border-slate-100 bg-white/95 px-6 py-4 backdrop-blur">
          <button type="button" onClick={onClose} className="rounded-xl border border-slate-200 px-5 py-3 font-bold">Kapat</button>
          {!effectiveReadOnly && <button type="submit" form="plan-item-editor-form" disabled={saving} className="rounded-xl bg-slate-900 px-5 py-3 font-bold text-white disabled:opacity-50">{saving ? 'Kaydediliyor…' : role === TRIP_ROLES.EDITOR && form.scope === PLAN_SCOPES.SHARED ? 'Öneri gönder' : 'Kaydet'}</button>}
        </footer>
      </div>
    </div>
  )
}
