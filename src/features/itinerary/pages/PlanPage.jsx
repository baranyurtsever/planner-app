import { useEffect, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { EmptyState, ErrorMessage } from '../../../shared/components/Feedback'
import {
  canDirectEditPlanItem,
  canProposePlanChange,
  canViewPlanItem,
} from '../../../shared/domain/access'
import { PlanItemEditor } from '../components/PlanItemEditor'
import { ProposalPanel } from '../components/ProposalPanel'
import {
  removePlanItem,
  subscribeToPlanItems,
  subscribeToPlanProposalDecisions,
  subscribeToPlanProposals,
} from '../data/planRepository'
import { PLAN_CATEGORY_MAP, normalizedPlanScope } from '../domain/planItem'
import { formatPlanTime } from '../domain/planTime'

const visibilityLabels = {
  private: 'Yalnızca ben',
  trip: 'Gezi katılımcıları',
  profile: 'Profilde açık',
}

export function PlanPage() {
  const { trip, user } = useOutletContext()
  const [items, setItems] = useState([])
  const [proposals, setProposals] = useState([])
  const [decisions, setDecisions] = useState([])
  const [editor, setEditor] = useState(null)
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')

  useEffect(
    () => subscribeToPlanItems(
      trip.id,
      user.uid,
      setItems,
      (subscriptionError) => setError(subscriptionError.message),
    ),
    [trip.id, user.uid],
  )

  useEffect(
    () => subscribeToPlanProposalDecisions(
      trip.id,
      setDecisions,
      (subscriptionError) => setError(subscriptionError.message),
    ),
    [trip.id],
  )

  useEffect(
    () => subscribeToPlanProposals(
      trip.id,
      setProposals,
      (subscriptionError) => setError(subscriptionError.message),
    ),
    [trip.id],
  )

  function openItem(item) {
    setEditor({
      item,
      readOnly: !canDirectEditPlanItem(trip, item, user.uid) &&
        !canProposePlanChange(trip, item, user.uid),
    })
  }

  async function remove(item) {
    const message = canProposePlanChange(trip, item, user.uid)
      ? 'Bu ortak kart için silme önerisi gönderilsin mi?'
      : 'Bu Plan Öğesi kalıcı olarak silinsin mi?'
    if (!window.confirm(message)) return
    setError('')
    try {
      const result = await removePlanItem(trip, item, user.uid)
      setNotice(result.kind === 'proposal' ? 'Silme önerisi gönderildi.' : 'Plan Öğesi silindi.')
    } catch (nextError) {
      setError(nextError.message)
    }
  }

  const visibleItems = items.filter((item) => canViewPlanItem(trip, item, user.uid))

  return (
    <section>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-teal-700">Gezi planı</p>
          <h2 className="mt-2 text-3xl font-black">Plan Öğeleri</h2>
          <p className="mt-2 text-sm text-slate-500">Ortak planı ve katılımcıların görünür kişisel planlarını birlikte gör.</p>
        </div>
        <button
          onClick={() => setEditor({ item: null, readOnly: false })}
          className="rounded-full bg-teal-800 px-5 py-3 text-sm font-bold text-white"
        >
          Plan ekle
        </button>
      </div>

      <div className="mt-5"><ErrorMessage message={error} /></div>
      {notice && <p className="mt-4 rounded-xl bg-teal-50 px-4 py-3 text-sm font-semibold text-teal-800">{notice}</p>}
      <ProposalPanel trip={trip} user={user} proposals={proposals} decisions={decisions} items={items} />

      <div className="mt-6 space-y-3">
        {visibleItems.map((item) => {
          const displayTime = formatPlanTime(item.time)
          const category = PLAN_CATEGORY_MAP[item.category] || PLAN_CATEGORY_MAP.other
          const direct = canDirectEditPlanItem(trip, item, user.uid)
          const proposal = canProposePlanChange(trip, item, user.uid)
          return (
            <article
              key={item.id}
              className="flex flex-col justify-between gap-5 rounded-2xl border border-slate-200 bg-white p-5 md:flex-row md:items-start"
            >
              <button onClick={() => openItem(item)} className="min-w-0 flex-1 text-left">
                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">
                    {category.icon} {category.label}
                  </span>
                  <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700">
                    {normalizedPlanScope(item) === 'shared' ? 'Ortak plan' : 'Kişisel plan'}
                  </span>
                  <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-bold text-teal-700">
                    {visibilityLabels[item.visibility]}
                  </span>
                </div>
                <h3 className="mt-3 text-lg font-black">{item.title}</h3>
                <p className="mt-1 text-sm text-slate-500">
                  {displayTime.start}{displayTime.end ? ` → ${displayTime.end}` : ''}
                </p>
                {item.notes && <p className="mt-3 text-sm text-slate-600">{item.notes}</p>}
                {item.location?.name && <p className="mt-2 text-sm font-semibold text-teal-700">📍 {item.location.name}</p>}
                {item.location?.address && item.location.address !== item.location.name && <p className="mt-1 text-xs text-slate-500">{item.location.address}</p>}
              </button>
              <div className="flex shrink-0 gap-3 md:flex-col md:items-end">
                <button onClick={() => openItem(item)} className="text-sm font-bold text-teal-700">
                  {direct ? 'Düzenle' : proposal ? 'Öneri hazırla' : 'İncele'}
                </button>
                {(direct || proposal) && (
                  <button onClick={() => remove(item)} className="text-sm font-bold text-rose-600">
                    {proposal ? 'Silme öner' : 'Sil'}
                  </button>
                )}
              </div>
            </article>
          )
        })}
      </div>

      {!visibleItems.length && (
        <div className="mt-6">
          <EmptyState title="Plan henüz boş" description="İlk ortak veya kişisel Plan Öğesini ekle." />
        </div>
      )}

      {editor && (
        <PlanItemEditor
          key={editor.duplicateOf ? `duplicate-${editor.duplicateOf.id}` : editor.item?.id || 'new'}
          trip={trip}
          user={user}
          item={editor.item}
          duplicateOf={editor.duplicateOf}
          liveItem={items.find((item) => item.id === editor.item?.id) || editor.item}
          readOnly={editor.readOnly}
          onClose={() => setEditor(null)}
          onDuplicate={(source) => setEditor({ item: null, duplicateOf: source, readOnly: false })}
          onSaved={(result) => setNotice(
            result.kind === 'proposal' ? 'Değişiklik önerisi gönderildi.' : 'Plan Öğesi kaydedildi.',
          )}
        />
      )}
    </section>
  )
}
