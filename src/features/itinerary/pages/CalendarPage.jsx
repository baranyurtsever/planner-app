import { useEffect, useMemo, useRef, useState } from 'react'
import { useOutletContext, useSearchParams } from 'react-router-dom'
import { EmptyState, ErrorMessage } from '../../../shared/components/Feedback'
import {
  canDirectEditPlanItem,
  canProposePlanChange,
} from '../../../shared/domain/access'
import { PlanItemEditor } from '../components/PlanItemEditor'
import { ProposalPanel } from '../components/ProposalPanel'
import {
  changePlanItem,
  subscribeToPlanItems,
  subscribeToPlanProposals,
} from '../data/planRepository'
import { moveWeek, planItemDate, weekDates } from '../domain/calendar'
import {
  CALENDAR_ROW_HEIGHT,
  layoutOverlappingItems,
  moveTimedPlan,
  resizeTimedPlan,
  snapCalendarMinute,
} from '../domain/calendarLayout'
import { PLAN_CATEGORY_MAP } from '../domain/planItem'
import { utcToZonedLocal } from '../domain/planTime'

const DAY_MINUTES = 24 * 60
const DAY_HEIGHT = CALENDAR_ROW_HEIGHT * 24
const today = () => new Date().toISOString().slice(0, 10)

const categoryStyles = {
  flight: 'border-indigo-300 bg-indigo-100 text-indigo-950',
  stay: 'border-purple-300 bg-purple-100 text-purple-950',
  transport: 'border-sky-300 bg-sky-100 text-sky-950',
  food: 'border-rose-300 bg-rose-100 text-rose-950',
  museum: 'border-emerald-300 bg-emerald-100 text-emerald-950',
  activity: 'border-teal-300 bg-teal-100 text-teal-950',
  entertainment: 'border-violet-300 bg-violet-100 text-violet-950',
  shopping: 'border-amber-300 bg-amber-100 text-amber-950',
  health: 'border-red-300 bg-red-100 text-red-950',
  other: 'border-slate-300 bg-slate-100 text-slate-950',
}

function addDays(value, amount) {
  const date = new Date(`${value}T12:00:00`)
  date.setDate(date.getDate() + amount)
  return date.toISOString().slice(0, 10)
}

function localMinute(instant, timeZone) {
  const local = utcToZonedLocal(instant, timeZone)
  const [hours, minutes] = local.slice(11).split(':').map(Number)
  return { date: local.slice(0, 10), minute: hours * 60 + minutes }
}

function calendarInterval(item) {
  const start = localMinute(item.time.startsAt, item.time.startTimeZone)
  const end = localMinute(item.time.endsAt, item.time.endTimeZone)
  const endMinute = end.date === start.date ? end.minute : DAY_MINUTES
  return {
    ...item,
    localDate: start.date,
    startMinute: start.minute,
    endMinute: Math.max(start.minute + 15, endMinute),
  }
}

function timeLabel(minute) {
  return `${String(Math.floor(minute / 60)).padStart(2, '0')}:${String(minute % 60).padStart(2, '0')}`
}

function useMobileCalendar() {
  const [mobile, setMobile] = useState(() => window.matchMedia('(max-width: 767px)').matches)
  useEffect(() => {
    const media = window.matchMedia('(max-width: 767px)')
    const update = () => setMobile(media.matches)
    media.addEventListener('change', update)
    return () => media.removeEventListener('change', update)
  }, [])
  return mobile
}

function CalendarCard({
  item,
  layout,
  ghost = false,
  deleting = false,
  onOpen,
  onInteractionStart,
  editable,
}) {
  const category = PLAN_CATEGORY_MAP[item.category] || PLAN_CATEGORY_MAP.other
  const height = Math.max(18, ((item.endMinute - item.startMinute) / 60) * CALENDAR_ROW_HEIGHT)
  return (
    <article
      role="button"
      tabIndex={0}
      title={`${item.title} · ${timeLabel(item.startMinute)}–${timeLabel(item.endMinute)}`}
      onClick={(event) => {
        event.stopPropagation()
        if (!ghost) onOpen(item)
      }}
      onKeyDown={(event) => {
        if ((event.key === 'Enter' || event.key === ' ') && !ghost) onOpen(item)
      }}
      onPointerDown={(event) => {
        if (!editable || ghost || event.button !== 0) return
        const edge = event.target.dataset.resizeEdge
        onInteractionStart(event, item, edge || 'move')
      }}
      className={`absolute z-10 overflow-hidden rounded-lg border px-2 py-1 text-left shadow-sm transition-shadow hover:z-30 hover:shadow-lg focus:z-30 focus:outline-none focus:ring-2 focus:ring-teal-500 ${
        categoryStyles[item.category] || categoryStyles.other
      } ${item.status === 'done' ? 'opacity-65' : ''} ${item.status === 'postponed' ? 'border-dashed' : ''} ${
        item.status === 'cancelled' ? 'line-through opacity-50' : ''
      } ${ghost ? 'pointer-events-none border-dashed opacity-55' : ''} ${deleting ? 'opacity-35 grayscale' : ''} ${
        editable ? 'cursor-grab touch-none active:cursor-grabbing' : 'cursor-pointer'
      }`}
      style={{
        top: `${(item.startMinute / 60) * CALENDAR_ROW_HEIGHT}px`,
        height: `${height}px`,
        left: `calc(${layout.leftPercent}% + 1px)`,
        width: `calc(${layout.widthPercent}% - 2px)`,
      }}
    >
      {editable && <span data-resize-edge="start" className="absolute inset-x-0 top-0 h-2 cursor-ns-resize" />}
      <p className="truncate text-[10px] font-black">
        {ghost ? 'ÖNERİ · ' : ''}{layout.columnCount > 1 ? '⚠ ' : ''}{category.icon} {timeLabel(item.startMinute)}–{timeLabel(item.endMinute)}
      </p>
      <h3 className="truncate text-xs font-black">{item.title}</h3>
      {height >= 48 && item.location?.name && <p className="truncate text-[10px] opacity-70">{item.location.name}</p>}
      {editable && <span data-resize-edge="end" className="absolute inset-x-0 bottom-0 h-2 cursor-ns-resize" />}
    </article>
  )
}

export function CalendarPage() {
  const { trip, user } = useOutletContext()
  const [searchParams, setSearchParams] = useSearchParams()
  const [items, setItems] = useState([])
  const [proposals, setProposals] = useState([])
  const [editor, setEditor] = useState(null)
  const [interaction, setInteraction] = useState(null)
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')
  const scrollRef = useRef(null)
  const boardRef = useRef(null)
  const longPressRef = useRef(null)
  const mobile = useMobileCalendar()
  const anchor = searchParams.get('date') || today()
  const days = useMemo(() => mobile ? [anchor] : weekDates(anchor), [anchor, mobile])

  useEffect(
    () => subscribeToPlanItems(
      trip.id,
      user.uid,
      setItems,
      (nextError) => setError(nextError.message),
    ),
    [trip.id, user.uid],
  )
  useEffect(
    () => subscribeToPlanProposals(
      trip.id,
      setProposals,
      (nextError) => setError(nextError.message),
    ),
    [trip.id],
  )
  useEffect(() => {
    if (!scrollRef.current) return
    const firstMinute = items
      .filter((item) => item.time?.kind === 'timed')
      .map((item) => calendarInterval(item))
      .filter((item) => days.includes(item.localDate))
      .reduce((earliest, item) => Math.min(earliest, item.startMinute), 8 * 60)
    scrollRef.current.scrollTop = Math.max(0, (firstMinute / 60) * CALENDAR_ROW_HEIGHT - 80)
  }, [days, items])

  const officialTimed = useMemo(
    () => items.filter((item) => item.time?.kind === 'timed').map(calendarInterval),
    [items],
  )
  const proposedTimed = useMemo(() => proposals.flatMap((proposal) => {
    if (proposal.action === 'delete') return []
    const original = items.find((item) => item.id === proposal.targetItemId)
    const candidate = proposal.action === 'create'
      ? { id: `proposal-${proposal.id}`, ...proposal.patch }
      : { ...original, ...proposal.patch, id: `proposal-${proposal.id}` }
    return candidate?.time?.kind === 'timed'
      ? [{ ...calendarInterval(candidate), proposalId: proposal.id }]
      : []
  }), [items, proposals])
  const deletingIds = useMemo(
    () => new Set(proposals.filter((proposal) => proposal.action === 'delete').map((proposal) => proposal.targetItemId)),
    [proposals],
  )
  const allDayByDate = useMemo(() => items.reduce((groups, item) => {
    if (item.time?.kind !== 'date') return groups
    const date = planItemDate(item)
    groups[date] = [...(groups[date] || []), item]
    return groups
  }, {}), [items])

  function navigate(amount) {
    const nextDate = mobile ? addDays(anchor, amount) : moveWeek(anchor, amount)
    setSearchParams({ date: nextDate })
  }

  function openItem(item) {
    const original = items.find((candidate) => candidate.id === item.id) || item
    setEditor({
      item: original,
      readOnly: !canDirectEditPlanItem(trip, original, user.uid) &&
        !canProposePlanChange(trip, original, user.uid),
    })
  }

  function createAt(date, minute = 9 * 60, dateOnly = false) {
    setEditor({ item: null, initialSlot: { localDate: date, startMinute: minute, dateOnly }, readOnly: false })
  }

  function beginInteraction(event, item, kind) {
    event.stopPropagation()
    event.currentTarget.setPointerCapture(event.pointerId)
    const itemTop = (item.startMinute / 60) * CALENDAR_ROW_HEIGHT
    const boardTop = boardRef.current.getBoundingClientRect().top
    setInteraction({
      item,
      kind,
      pointerId: event.pointerId,
      offsetY: event.clientY - boardTop - itemTop,
      preview: item.time,
    })
  }

  function cancelLongPress() {
    if (!longPressRef.current) return
    window.clearTimeout(longPressRef.current.timer)
    longPressRef.current = null
  }

  function beginEmptyLongPress(event, date) {
    if (!mobile || event.pointerType === 'mouse' || event.target !== event.currentTarget) return
    const rect = event.currentTarget.getBoundingClientRect()
    const minute = snapCalendarMinute(((event.clientY - rect.top) / CALENDAR_ROW_HEIGHT) * 60)
    cancelLongPress()
    longPressRef.current = {
      x: event.clientX,
      y: event.clientY,
      timer: window.setTimeout(() => {
        longPressRef.current = null
        createAt(date, minute)
      }, 550),
    }
  }

  function pointerPosition(event) {
    const rect = boardRef.current.getBoundingClientRect()
    const labelWidth = 64
    const dayWidth = (rect.width - labelWidth) / days.length
    const dayIndex = Math.max(0, Math.min(days.length - 1, Math.floor((event.clientX - rect.left - labelWidth) / dayWidth)))
    const minute = snapCalendarMinute(((event.clientY - rect.top) / CALENDAR_ROW_HEIGHT) * 60)
    return { date: days[dayIndex], minute }
  }

  function moveInteraction(event) {
    if (!interaction) {
      const pending = longPressRef.current
      if (pending && Math.hypot(event.clientX - pending.x, event.clientY - pending.y) > 8) {
        cancelLongPress()
      }
      return
    }
    if (event.pointerId !== interaction.pointerId) return
    const position = pointerPosition(event)
    let preview
    if (interaction.kind === 'move') {
      const offsetMinutes = (interaction.offsetY / CALENDAR_ROW_HEIGHT) * 60
      preview = moveTimedPlan(interaction.item.time, {
        localDate: position.date,
        startMinute: position.minute - offsetMinutes,
      })
    } else {
      preview = resizeTimedPlan(interaction.item.time, {
        edge: interaction.kind,
        localDate: interaction.item.localDate,
        minute: position.minute,
      })
    }
    setInteraction((current) => ({ ...current, preview }))
  }

  async function endInteraction(event) {
    if (!interaction) {
      cancelLongPress()
      return
    }
    if (event.pointerId !== interaction.pointerId) return
    const current = interaction
    setInteraction(null)
    if (JSON.stringify(current.preview) === JSON.stringify(current.item.time)) return
    try {
      const result = await changePlanItem(trip, current.item, user.uid, { time: current.preview })
      setNotice(result.kind === 'proposal' ? 'Takvim değişikliği öneri olarak gönderildi.' : 'Takvim güncellendi.')
    } catch (nextError) {
      setError(nextError.message)
    }
  }

  const interactionPreview = interaction
    ? { ...interaction.item, ...calendarInterval({ ...interaction.item, time: interaction.preview }), id: `preview-${interaction.item.id}` }
    : null
  const rangeLabel = mobile
    ? new Date(`${anchor}T12:00:00`).toLocaleDateString('tr-TR', { dateStyle: 'full' })
    : `${new Date(`${days[0]}T12:00:00`).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })} – ${new Date(`${days[6]}T12:00:00`).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' })}`

  return (
    <section>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-teal-700">Etkileşimli plan</p>
          <h2 className="mt-2 text-3xl font-black">Takvim</h2>
          <p className="mt-1 text-sm font-semibold text-slate-500">{rangeLabel}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button onClick={() => navigate(-1)} className="rounded-full border border-slate-200 bg-white px-4 py-2 font-bold">←</button>
          <button onClick={() => setSearchParams({ date: today() })} className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-bold">Bugün</button>
          <input
            aria-label="Takvim tarihi"
            type="date"
            value={anchor}
            onChange={(event) => setSearchParams({ date: event.target.value })}
            className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-bold"
          />
          <button onClick={() => navigate(1)} className="rounded-full border border-slate-200 bg-white px-4 py-2 font-bold">→</button>
          <button onClick={() => createAt(anchor)} className="rounded-full bg-teal-800 px-5 py-2 text-sm font-bold text-white">Plan ekle</button>
        </div>
      </div>
      <div className="mt-4"><ErrorMessage message={error} /></div>
      {notice && <p className="mt-3 rounded-xl bg-teal-50 px-4 py-3 text-sm font-semibold text-teal-800">{notice}</p>}
      <ProposalPanel trip={trip} user={user} proposals={proposals} />

      <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="grid border-b border-slate-200 bg-slate-50" style={{ gridTemplateColumns: `64px repeat(${days.length}, minmax(0, 1fr))` }}>
          <div />
          {days.map((date) => (
            <div key={date} className={`border-l border-slate-200 px-2 py-3 text-center ${date === today() ? 'bg-teal-50' : ''}`}>
              <p className="text-[10px] font-bold uppercase text-slate-400">
                {new Date(`${date}T12:00:00`).toLocaleDateString('tr-TR', { weekday: 'short' })}
              </p>
              <p className="text-sm font-black">{new Date(`${date}T12:00:00`).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}</p>
            </div>
          ))}
        </div>
        <div className="grid border-b border-slate-200" style={{ gridTemplateColumns: `64px repeat(${days.length}, minmax(0, 1fr))` }}>
          <div className="p-2 text-[10px] font-bold uppercase text-slate-400">Tüm gün</div>
          {days.map((date) => (
            <div
              key={date}
              onDoubleClick={() => createAt(date, 9 * 60, true)}
              className="min-h-16 border-l border-slate-200 p-1"
            >
              {(allDayByDate[date] || []).map((item) => (
                <button
                  key={item.id}
                  onClick={() => openItem(item)}
                  className="mb-1 w-full truncate rounded-md bg-slate-800 px-2 py-1 text-left text-xs font-bold text-white"
                >
                  {PLAN_CATEGORY_MAP[item.category]?.icon} {item.title}
                </button>
              ))}
            </div>
          ))}
        </div>

        <div ref={scrollRef} className="max-h-[70vh] overflow-y-auto">
          <div
            ref={boardRef}
            onPointerMove={moveInteraction}
            onPointerUp={endInteraction}
            onPointerCancel={() => setInteraction(null)}
            className="relative grid"
            style={{ height: DAY_HEIGHT, gridTemplateColumns: `64px repeat(${days.length}, minmax(0, 1fr))` }}
          >
            <div className="relative">
              {Array.from({ length: 24 }, (_, hour) => (
                <span key={hour} className="absolute right-2 -translate-y-2 text-[10px] font-semibold text-slate-400" style={{ top: hour * CALENDAR_ROW_HEIGHT }}>
                  {String(hour).padStart(2, '0')}:00
                </span>
              ))}
            </div>
            {days.map((date) => {
              const dayItems = officialTimed.filter((item) => item.localDate === date)
              const dayGhosts = proposedTimed.filter((item) => item.localDate === date)
              const preview = interactionPreview?.localDate === date ? [interactionPreview] : []
              const layoutItems = [...dayItems.filter((item) => item.id !== interaction?.item.id), ...dayGhosts, ...preview]
              const layouts = layoutOverlappingItems(layoutItems)
              return (
                <div
                  key={date}
                  onPointerDown={(event) => beginEmptyLongPress(event, date)}
                  onDoubleClick={(event) => {
                    if (event.target !== event.currentTarget) return
                    const rect = event.currentTarget.getBoundingClientRect()
                    createAt(date, snapCalendarMinute(((event.clientY - rect.top) / CALENDAR_ROW_HEIGHT) * 60))
                  }}
                  className={`relative border-l border-slate-200 ${date === today() ? 'bg-teal-50/30' : ''}`}
                  style={{
                    backgroundImage: 'repeating-linear-gradient(to bottom, transparent 0, transparent 31px, rgb(226 232 240) 32px)',
                    backgroundSize: `100% ${CALENDAR_ROW_HEIGHT / 2}px`,
                  }}
                >
                  {layoutItems.map((item) => (
                    <CalendarCard
                      key={item.id}
                      item={item}
                      layout={layouts[item.id]}
                      ghost={Boolean(item.proposalId) || item.id.startsWith('preview-')}
                      deleting={deletingIds.has(item.id)}
                      editable={!item.proposalId && !item.id.startsWith('preview-') && (
                        canDirectEditPlanItem(trip, item, user.uid) ||
                        canProposePlanChange(trip, item, user.uid)
                      )}
                      onOpen={openItem}
                      onInteractionStart={beginInteraction}
                    />
                  ))}
                  {date === today() && (() => {
                    const now = new Date()
                    const minute = now.getHours() * 60 + now.getMinutes()
                    return <div className="pointer-events-none absolute inset-x-0 z-40 border-t-2 border-rose-500" style={{ top: (minute / 60) * CALENDAR_ROW_HEIGHT }} />
                  })()}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {!items.length && <div className="mt-5"><EmptyState title="Takvim boş" description="Boş bir saate çift tıkla veya Plan ekle düğmesini kullan." /></div>}

      {editor && (
        <PlanItemEditor
          trip={trip}
          user={user}
          item={editor.item}
          initialSlot={editor.initialSlot}
          readOnly={editor.readOnly}
          onClose={() => setEditor(null)}
          onSaved={(result) => setNotice(
            result.kind === 'proposal' ? 'Değişiklik önerisi gönderildi.' : 'Plan Öğesi kaydedildi.',
          )}
        />
      )}
    </section>
  )
}
