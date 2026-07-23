import { useState } from 'react'

const initialForm = { name: '', locationName: '', visibility: 'private' }

export function TripCreateForm({ onSubmit }) {
  const [form, setForm] = useState(initialForm)

  async function submit(event) {
    event.preventDefault()
    await onSubmit(form)
    setForm(initialForm)
  }

  return (
    <form
      onSubmit={submit}
      className="mt-6 grid gap-4 rounded-2xl border border-slate-200 bg-white p-5 md:grid-cols-[1fr_1fr_auto_auto]"
    >
      <input
        required
        aria-label="Gezi adı"
        placeholder="Gezi adı"
        value={form.name}
        onChange={(event) => setForm({ ...form, name: event.target.value })}
        className="rounded-xl border border-slate-200 px-4 py-3"
      />
      <input
        aria-label="Konum"
        placeholder="Konum"
        value={form.locationName}
        onChange={(event) => setForm({ ...form, locationName: event.target.value })}
        className="rounded-xl border border-slate-200 px-4 py-3"
      />
      <select
        aria-label="Gezi görünürlüğü"
        value={form.visibility}
        onChange={(event) => setForm({ ...form, visibility: event.target.value })}
        className="rounded-xl border border-slate-200 px-4 py-3"
      >
        <option value="private">Gizli</option>
        <option value="profile">Profilde görünür</option>
      </select>
      <button className="rounded-xl bg-slate-900 px-5 py-3 font-bold text-white">Oluştur</button>
    </form>
  )
}
