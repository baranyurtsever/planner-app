import { useEffect, useState } from 'react'
import { ErrorMessage } from '../../../shared/components/Feedback'
import {
  createPlanDocument,
  removePlanDocument,
  subscribeToPlanDocuments,
  updatePlanDocument,
} from '../data/planDocumentRepository'

const kindLabels = {
  ticket: 'Bilet',
  reservation: 'Rezervasyon',
  qr: 'QR bağlantısı',
  pdf: 'PDF',
  link: 'Bağlantı',
}

const emptyForm = {
  title: '',
  kind: 'reservation',
  url: '',
  reservationCode: '',
  visibility: 'private',
}

export function PlanDocumentsSection({ trip, item, user }) {
  const [documents, setDocuments] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState(null)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => subscribeToPlanDocuments(
    trip.id,
    item.id,
    user.uid,
    setDocuments,
    (nextError) => setError(nextError.message),
  ), [item.id, trip.id, user.uid])

  async function submit(event) {
    event.preventDefault()
    setSaving(true)
    setError('')
    try {
      if (editingId) await updatePlanDocument(trip.id, item.id, editingId, form)
      else await createPlanDocument(trip.id, item.id, user.uid, form)
      setEditingId(null)
      setForm(emptyForm)
    } catch (nextError) {
      setError(nextError.message)
    } finally {
      setSaving(false)
    }
  }

  function edit(document) {
    setEditingId(document.id)
    setForm({
      title: document.title,
      kind: document.kind,
      url: document.url,
      reservationCode: document.reservationCode,
      visibility: document.visibility,
    })
  }

  async function remove(document) {
    if (!window.confirm('Bu Plan Belgesi silinsin mi?')) return
    setError('')
    try {
      await removePlanDocument(trip.id, item.id, document.id)
    } catch (nextError) {
      setError(nextError.message)
    }
  }

  return (
    <section className="border-t border-slate-100 px-6 py-5">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-teal-700">Bilet ve rezervasyonlar</p>
      <h3 className="mt-1 text-lg font-black">Plan Belgeleri</h3>
      <p className="mt-1 text-xs text-slate-500">Eklediğin bilgiler varsayılan olarak yalnız sana görünür. Profilde hiçbir zaman yayınlanmaz.</p>

      <div className="mt-4 space-y-2">
        {documents.map((document) => {
          const owned = document.ownerId === user.uid
          return (
            <article key={document.id} className="flex flex-wrap items-start justify-between gap-3 rounded-xl bg-slate-50 p-4">
              <div className="min-w-0">
                <div className="flex flex-wrap gap-2 text-xs font-bold">
                  <span className="rounded-full bg-white px-2 py-1">{kindLabels[document.kind]}</span>
                  <span className="rounded-full bg-white px-2 py-1">{document.visibility === 'trip' ? 'Geziyle paylaşıldı' : 'Yalnızca ben'}</span>
                </div>
                <p className="mt-2 font-black">{document.title}</p>
                {document.reservationCode && <p className="mt-1 font-mono text-sm text-slate-600">{document.reservationCode}</p>}
                {document.url && <a href={document.url} target="_blank" rel="noreferrer" className="mt-1 block break-all text-sm font-bold text-teal-700">Belgeyi aç</a>}
              </div>
              {owned && (
                <div className="flex gap-3">
                  <button type="button" onClick={() => edit(document)} className="text-sm font-bold text-teal-700">Düzenle</button>
                  <button type="button" onClick={() => remove(document)} className="text-sm font-bold text-rose-600">Sil</button>
                </div>
              )}
            </article>
          )
        })}
        {!documents.length && <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500">Henüz bilet veya rezervasyon eklenmedi.</p>}
      </div>

      <form onSubmit={submit} className="mt-4 grid gap-3 rounded-2xl border border-slate-200 p-4 md:grid-cols-2">
        <input required aria-label="Belge başlığı" placeholder="Belge başlığı" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} className="min-w-0 rounded-xl border border-slate-200 px-3 py-2" />
        <select aria-label="Belge türü" value={form.kind} onChange={(event) => setForm({ ...form, kind: event.target.value })} className="min-w-0 rounded-xl border border-slate-200 px-3 py-2">
          {Object.entries(kindLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
        <input aria-label="Belge bağlantısı" type="url" placeholder="https://…" value={form.url} onChange={(event) => setForm({ ...form, url: event.target.value })} className="min-w-0 rounded-xl border border-slate-200 px-3 py-2" />
        <input aria-label="Rezervasyon numarası" placeholder="Rezervasyon numarası" value={form.reservationCode} onChange={(event) => setForm({ ...form, reservationCode: event.target.value })} className="min-w-0 rounded-xl border border-slate-200 px-3 py-2" />
        <select aria-label="Belge görünürlüğü" value={form.visibility} onChange={(event) => setForm({ ...form, visibility: event.target.value })} className="min-w-0 rounded-xl border border-slate-200 px-3 py-2">
          <option value="private">Yalnızca ben</option>
          <option value="trip">Gezi katılımcıları</option>
        </select>
        <div className="flex justify-end gap-2">
          {editingId && <button type="button" onClick={() => { setEditingId(null); setForm(emptyForm) }} className="rounded-xl border border-slate-200 px-4 py-2 font-bold">Vazgeç</button>}
          <button disabled={saving} className="rounded-xl bg-teal-800 px-4 py-2 font-bold text-white disabled:opacity-50">{editingId ? 'Belgeyi güncelle' : 'Belge ekle'}</button>
        </div>
      </form>
      <div className="mt-3"><ErrorMessage message={error} /></div>
    </section>
  )
}
