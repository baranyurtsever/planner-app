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

export function ProposalPanel({ trip, user, proposals }) {
  const [busyId, setBusyId] = useState('')
  const [error, setError] = useState('')
  const isOwner = tripRole(trip, user.uid) === TRIP_ROLES.OWNER

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
        {proposals.map((proposal) => (
          <article key={proposal.id} className="rounded-2xl border border-amber-200 bg-white p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-black">{proposal.patch?.title || actionLabels[proposal.action]}</p>
                <p className="mt-1 text-xs text-slate-500">
                  Öneren: {proposal.proposerId} · {actionLabels[proposal.action]}
                </p>
                {proposal.action === 'update' && (
                  <p className="mt-2 text-xs font-semibold text-amber-800">
                    Ezilecek alanlar: {changedFields(proposal).join(', ') || '—'}
                  </p>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {isOwner && (
                  <>
                    <button
                      disabled={busyId === proposal.id}
                      onClick={() => decide(proposal, 'approve')}
                      className="rounded-full bg-teal-700 px-3 py-2 text-xs font-bold text-white disabled:opacity-50"
                    >
                      Onayla
                    </button>
                    <button
                      disabled={busyId === proposal.id}
                      onClick={() => decide(proposal, 'reject')}
                      className="rounded-full border border-rose-200 px-3 py-2 text-xs font-bold text-rose-700 disabled:opacity-50"
                    >
                      Reddet
                    </button>
                  </>
                )}
                {proposal.proposerId === user.uid && (
                  <button
                    disabled={busyId === proposal.id}
                    onClick={() => decide(proposal, 'withdraw')}
                    className="rounded-full border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600 disabled:opacity-50"
                  >
                    Geri çek
                  </button>
                )}
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
