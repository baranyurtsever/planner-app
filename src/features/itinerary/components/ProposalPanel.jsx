import { useState } from 'react'
import { tripRole, TRIP_ROLES } from '../../../shared/domain/access'
import {
  approvePlanProposal,
  rejectPlanProposal,
  withdrawPlanProposal,
} from '../data/planRepository'

const actionLabels = {
  create: 'Yeni ortak kart',
  update: 'Ortak kart değişikliği',
  delete: 'Ortak kartı silme',
}

function changedFields(proposal) {
  return Object.keys(proposal.patch || {}).filter((field) => field !== 'updatedAt')
}

function displayValue(value) {
  if (value === undefined || value === null || value === '') return '—'
  if (typeof value === 'object') return JSON.stringify(value)
  return String(value)
}

export function ProposalPanel({ trip, user, proposals, items = [] }) {
  const [busyId, setBusyId] = useState('')
  const [error, setError] = useState('')
  const isOwner = tripRole(trip, user.uid) === TRIP_ROLES.OWNER
  const groups = proposals.reduce((result, proposal) => {
    const current = result.get(proposal.targetItemId) || []
    result.set(proposal.targetItemId, [...current, proposal])
    return result
  }, new Map())

  if (!proposals.length) return null

  async function decide(proposal, decision) {
    setBusyId(proposal.id)
    setError('')
    try {
      if (decision === 'approve') {
        await approvePlanProposal(trip.id, proposal.id, user.uid)
      } else if (decision === 'reject') {
        await rejectPlanProposal(trip.id, proposal.id, user.uid)
      } else {
        await withdrawPlanProposal(trip.id, proposal.id, user.uid)
      }
    } catch (nextError) {
      setError(nextError.message)
    } finally {
      setBusyId('')
    }
  }

  return (
    <section className="mt-6 rounded-3xl border border-amber-200 bg-amber-50 p-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-700">Bekleyen öneriler</p>
          <h3 className="mt-1 text-xl font-black">{proposals.length} değişiklik karar bekliyor</h3>
        </div>
        <span className="rounded-full bg-amber-200 px-3 py-1 text-xs font-black text-amber-900">
          Her katılımcı görür
        </span>
      </div>
      {error && <p className="mt-3 text-sm font-semibold text-rose-700">{error}</p>}
      <div className="mt-4 space-y-3">
        {[...groups.entries()].map(([targetItemId, targetProposals]) => {
          const currentItem = items.find((item) => item.id === targetItemId)
          return (
            <article key={targetItemId} className="rounded-2xl border border-amber-200 bg-white p-4">
              <h4 className="font-black">{currentItem?.title || targetProposals[0].patch?.title || actionLabels[targetProposals[0].action]}</h4>
              <div className="mt-3 space-y-3">
                {targetProposals.map((proposal) => (
                  <div key={proposal.id} className="rounded-xl bg-amber-50 p-3">
                    <p className="text-xs font-semibold text-slate-500">@{proposal.proposerId} · {actionLabels[proposal.action]}</p>
                    {proposal.action === 'update' && changedFields(proposal).map((field) => (
                      <p key={field} className="mt-1 break-words text-xs font-semibold text-amber-900">
                        {displayValue(currentItem?.[field])} → {displayValue(proposal.patch[field])}
                      </p>
                    ))}
                    <div className="mt-3 flex flex-wrap gap-2">
                      {isOwner && <button disabled={busyId === proposal.id} onClick={() => decide(proposal, 'approve')} className="rounded-full bg-teal-700 px-3 py-2 text-xs font-bold text-white disabled:opacity-50">Onayla</button>}
                      {isOwner && <button disabled={busyId === proposal.id} onClick={() => decide(proposal, 'reject')} className="rounded-full border border-rose-200 px-3 py-2 text-xs font-bold text-rose-700 disabled:opacity-50">Reddet</button>}
                      {proposal.proposerId === user.uid && <button disabled={busyId === proposal.id} onClick={() => decide(proposal, 'withdraw')} className="rounded-full border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600 disabled:opacity-50">Geri çek</button>}
                    </div>
                  </div>
                ))}
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}
