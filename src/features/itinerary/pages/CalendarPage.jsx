import { useEffect, useMemo, useRef, useState } from 'react'
import { useOutletContext, useSearchParams } from 'react-router-dom'
import { EmptyState, ErrorMessage } from '../../../shared/components/Feedback'
import {
  canDirectEditPlanItem,
  canProposePlanChange,
} from '../../../shared/domain/access'
import { CalendarScrollFrame } from '../components/CalendarScrollFrame'
import { CalendarCard } from '../components/CalendarCard'
import { PlanItemEditor } from '../components/PlanItemEditor'
import { ProposalPanel } from '../components/ProposalPanel'
import {
  changePlanItem,
  subscribeToPlanItems,
  subscribeToPlanProposals,
} from '../data/planRepository'
import {
  addCalendarDays,
  calendarIntervals,
  localToday,
  moveWeek,
  normalizeCalendarDate,
  planItemDate,
  weekDates,
} from '../domain/calendar'
import {
  CALENDAR_ROW_HEIGHT,
  layoutOverlappingItems,
  moveTimedPlan,
  resizeTimedPlan,
  snapCalendarMinute,
} from '../domain/calendarLayout'
import { PLAN_CATEGORY_MAP } from '../domain/planItem'
import { downloadIcsCalendar, exportablePlanItems } from '../domain/icsCalendar'

const DAY_HEIGHT = CALENDAR_ROW_HEIGHT * 24

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

export function CalendarPage() {
  const { trip, user } = useOutletContext()
  const [searchParams, setSearchParams] = useSearchParams()
  const [items, setItems] = useState([])
  const [proposals, setProposals] = useState([])
  const [editor, setEditor] = useState(null)
  const [interaction, setInteraction] = useState(null)
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')
  const [failedChange, setFailedChange] = useState(null)
  const [optimisticTimes, setOptimisticTimes] = useState({})
  const [proposalSelection, setProposalSelection] = useState({})
  const [now, setNow] = useState(() => new Date())
  const scrollRef = useRef(null)
  const boardRef = useRef(null)
  const longPressRef = useRef(null)
  const suppressClickRef = useRef(false)
  const autoScrolledRangeRef = useRef('')
  const mobile = useMobileCalendar()
  const currentDate = localToday(now)
  const anchor = normalizeCalendarDate(searchParams.get('date'), currentDate)
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
    const timer = window.setInterval(() => setNow(new Date()), 60_000)
    return () => window.clearInterval(timer)
  }, [])
  useEffect(() => () => {
    if (longPressRef.current) window.clearTimeout(longPressRef.current.timer)
  }, [])
  useEffect(() => {
    if (!scrollRef.current) return
    const rangeKey = days.join(':')
    if (autoScrolledRangeRef.current === rangeKey) return
    const firstMinute = items
      .filter((item) => item.time?.kind === 'timed')
      .flatMap((item) => calendarIntervals(item))
      .filter((item) => days.includes(item.localDate))
      .reduce((earliest, item) => Math.min(earliest, item.startMinute), 8 * 60)
    scrollRef.current.scrollTop = Math.max(0, (firstMinute / 60) * CALENDAR_ROW_HEIGHT - 80)
    autoScrolledRangeRef.current = rangeKey
  }, [days, items])

  useEffect(() => {
    setOptimisticTimes((current) => Object.fromEntries(
      Object.entries(current).filter(([itemId, time]) => {
        const saved = items.find((item) => item.id === itemId)
        return !saved || JSON.stringify(saved.time) !== JSON.stringify(time)
      }),
    ))
  }, [items])

  const displayedItems = useMemo(() => items.map((item) => (
    optimisticTimes[item.id] ? { ...item, time: optimisticTimes[item.id] } : item
  )), [items, optimisticTimes])

  const officialTimed = useMemo(
    () => displayedItems.filter((item) => item.time?.kind === 'timed').flatMap(calendarIntervals),
    [displayedItems],
  )
  const proposedTimedVariants = useMemo(() => proposals.flatMap((proposal) => {
    if (proposal.action === 'delete') return []
    const original = items.find((item) => item.id === proposal.targetItemId)
    const candidate = proposal.action === 'create'
      ? { id: `proposal-${proposal.id}`, ...proposal.patch }
      : { ...original, ...proposal.patch, id: `proposal-${proposal.id}` }
    return candidate?.time?.kind === 'timed'
      ? calendarIntervals(candidate).map((interval) => ({ ...interval, proposalId: proposal.id, proposerId: proposal.proposerId, targetItemId: proposal.targetItemId }))
      : []
  }), [items, proposals])
  const proposedTimed = useMemo(() => {
    const groups = new Map()
    proposedTimedVariants.forEach((item) => {
      const key = `${item.targetItemId}:${item.localDate}`
      groups.set(key, [...(groups.get(key) || []), item])
    })
    return [...groups.entries()].map(([key, options]) => {
      const selected = options.find((option) => option.proposalId === proposalSelection[key]) || options[0]
      return { ...selected, proposalGroupKey: key, proposalOptions: options }
    })
  }, [proposalSelection, proposedTimedVariants])
  const proposedAllDayVariants = useMemo(() => proposals.reduce((groups, proposal) => {
    if (proposal.action === 'delete') return groups
    const original = items.find((item) => item.id === proposal.targetItemId)
    const candidate = proposal.action === 'create'
      ? { id: `proposal-${proposal.id}`, ...proposal.patch }
      : { ...original, ...proposal.patch, id: `proposal-${proposal.id}` }
    if (candidate?.time?.kind !== 'date') return groups
    const date = planItemDate(candidate)
    groups[date] = [...(groups[date] || []), {
      ...candidate,
      proposalId: proposal.id,
      proposerId: proposal.proposerId,
      targetItemId: proposal.targetItemId,
    }]
    return groups
  }, {}), [items, proposals])
  const proposedAllDayByDate = useMemo(() => Object.fromEntries(
    Object.entries(proposedAllDayVariants).map(([date, variants]) => {
      const groups = new Map()
      variants.forEach((item) => {
        const key = `${item.targetItemId}:${date}`
        groups.set(key, [...(groups.get(key) || []), item])
      })
      return [date, [...groups.entries()].map(([key, options]) => {
        const selected = options.find((option) => option.proposalId === proposalSelection[key]) || options[0]
        return { ...selected, proposalGroupKey: key, proposalOptions: options }
      })]
    }),
  ), [proposalSelection, proposedAllDayVariants])
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
    const nextDate = mobile ? addCalendarDays(anchor, amount) : moveWeek(anchor, amount)
    setSearchParams({ date: nextDate })
  }

  function openItem(item) {
    if (suppressClickRef.current) {
      suppressClickRef.current = false
      return
    }
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

  function startInteraction(event, item, kind) {
    event.element.setPointerCapture(event.pointerId)
    const itemTop = (item.startMinute / 60) * CALENDAR_ROW_HEIGHT
    const boardTop = boardRef.current.getBoundingClientRect().top
    setInteraction({
      item,
      kind,
      pointerId: event.pointerId,
      originX: event.clientX,
      originY: event.clientY,
      moved: false,
      offsetY: event.clientY - boardTop - itemTop,
      preview: item.time,
    })
  }

  function beginInteraction(event, item, kind) {
    event.stopPropagation()
    const interactionEvent = {
      element: event.currentTarget,
      pointerId: event.pointerId,
      clientX: event.clientX,
      clientY: event.clientY,
    }
    if (event.pointerType !== 'touch') {
      startInteraction(interactionEvent, item, kind)
      return
    }
    cancelLongPress()
    longPressRef.current = {
      x: event.clientX,
      y: event.clientY,
      timer: window.setTimeout(() => {
        longPressRef.current = null
        startInteraction(interactionEvent, item, kind)
      }, 450),
    }
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
    if (!interaction.moved && Math.hypot(
      event.clientX - interaction.originX,
      event.clientY - interaction.originY,
    ) < 6) return
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
    setInteraction((current) => ({ ...current, moved: true, preview }))
  }

  async function commitChange(current) {
    setError('')
    setFailedChange(null)
    const direct = canDirectEditPlanItem(trip, current.item, user.uid)
    if (direct) setOptimisticTimes((times) => ({ ...times, [current.item.id]: current.preview }))
    try {
      const result = await changePlanItem(trip, current.item, user.uid, { time: current.preview })
      setNotice(result.kind === 'proposal' ? 'Takvim değişikliği öneri olarak gönderildi.' : 'Takvim güncellendi.')
    } catch (nextError) {
      if (direct) setOptimisticTimes((times) => {
        const next = { ...times }
        delete next[current.item.id]
        return next
      })
      setError(nextError.message)
      setFailedChange(current)
    }
  }

  async function endInteraction(event) {
    if (!interaction) {
      cancelLongPress()
      return
    }
    if (event.pointerId !== interaction.pointerId) return
    const current = interaction
    setInteraction(null)
    if (current.moved) suppressClickRef.current = true
    if (!current.moved) return
    if (JSON.stringify(current.preview) === JSON.stringify(current.item.time)) return
    await commitChange(current)
  }

  const interactionPreview = interaction
    ? (() => {
        const intervals = calendarIntervals({ ...interaction.item, time: interaction.preview })
        const interval = intervals.find((candidate) => candidate.localDate === interaction.item.localDate) || intervals[0]
        return interval ? { ...interval, id: `preview-${interaction.item.id}`, interactionPreview: true } : null
      })()
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
          <button onClick={() => setSearchParams({ date: currentDate })} className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-bold">Bugün</button>
          <input
            aria-label="Takvim tarihi"
            type="date"
            value={anchor}
            onChange={(event) => setSearchParams({ date: event.target.value })}
            className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-bold"
          />
          <button onClick={() => navigate(1)} className="rounded-full border border-slate-200 bg-white px-4 py-2 font-bold">→</button>
          <button
            onClick={() => downloadIcsCalendar(exportablePlanItems(items, user.uid), trip.name, `${trip.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'peregrin'}.ics`)}
            className="rounded-full border border-teal-700 bg-white px-4 py-2 text-sm font-bold text-teal-800"
          >
            Takvimi dışa aktar
          </button>
          <button onClick={() => createAt(anchor)} className="rounded-full bg-teal-800 px-5 py-2 text-sm font-bold text-white">Plan ekle</button>
        </div>
      </div>
      <div className="mt-4"><ErrorMessage message={error} /></div>
      {failedChange && <button type="button" onClick={() => commitChange(failedChange)} className="mt-2 rounded-full border border-rose-200 px-4 py-2 text-sm font-bold text-rose-700">Yeniden dene</button>}
      {notice && <p className="mt-3 rounded-xl bg-teal-50 px-4 py-3 text-sm font-semibold text-teal-800">{notice}</p>}
      <ProposalPanel trip={trip} user={user} proposals={proposals} items={items} />

      <CalendarScrollFrame
        scrollRef={scrollRef}
        header={(
          <div data-testid="calendar-header" className="grid border-b border-slate-200 bg-slate-50" style={{ gridTemplateColumns: `64px repeat(${days.length}, minmax(0, 1fr))` }}>
            <div />
            {days.map((date) => (
              <div key={date} className={`border-l border-slate-200 px-2 py-3 text-center ${date === currentDate ? 'bg-teal-50' : ''}`}>
                <p className="text-[10px] font-bold uppercase text-slate-400">
                  {new Date(`${date}T12:00:00`).toLocaleDateString('tr-TR', { weekday: 'short' })}
                </p>
                <p className="text-sm font-black">{new Date(`${date}T12:00:00`).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}</p>
              </div>
            ))}
          </div>
        )}
        allDay={(
          <div data-testid="calendar-all-day" className="grid border-b border-slate-200 bg-white" style={{ gridTemplateColumns: `64px repeat(${days.length}, minmax(0, 1fr))` }}>
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
                {(proposedAllDayByDate[date] || []).map((item) => (
                  <div key={item.proposalGroupKey} className="mb-1 rounded-md border border-dashed border-amber-400 bg-amber-100 px-2 py-1 text-xs font-bold text-amber-950 opacity-70">
                    <p className="truncate">ÖNERİ @{item.proposerId} · {PLAN_CATEGORY_MAP[item.category]?.icon} {item.title}</p>
                    {item.proposalOptions.length > 1 && (
                      <select
                        aria-label={`${item.targetItemId} önerileri`}
                        value={item.proposalId}
                        onChange={(event) => setProposalSelection((current) => ({ ...current, [item.proposalGroupKey]: event.target.value }))}
                        className="mt-1 w-full rounded border border-amber-300 bg-white px-1 py-0.5 text-[10px]"
                      >
                        {item.proposalOptions.map((option) => <option key={option.proposalId} value={option.proposalId}>@{option.proposerId}</option>)}
                      </select>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      >
        <div
            data-testid="calendar-time-board"
            ref={boardRef}
            onPointerMove={moveInteraction}
            onPointerUp={endInteraction}
            onPointerCancel={() => {
              setInteraction(null)
              suppressClickRef.current = true
            }}
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
              const renderedItems = [...dayItems, ...dayGhosts, ...preview]
              const layoutItems = [
                ...dayItems.filter((item) => item.id !== interaction?.item.id),
                ...dayGhosts,
                ...preview,
              ]
              const layouts = layoutOverlappingItems(layoutItems)
              const persistentLayouts = layoutOverlappingItems([...dayItems, ...dayGhosts])
              return (
                <div
                  key={date}
                  onPointerDown={(event) => beginEmptyLongPress(event, date)}
                  onDoubleClick={(event) => {
                    if (event.target !== event.currentTarget) return
                    const rect = event.currentTarget.getBoundingClientRect()
                    createAt(date, snapCalendarMinute(((event.clientY - rect.top) / CALENDAR_ROW_HEIGHT) * 60))
                  }}
                  className={`relative border-l border-slate-200 ${date === currentDate ? 'bg-teal-50/30' : ''}`}
                  style={{
                    backgroundImage: 'repeating-linear-gradient(to bottom, transparent 0, transparent 31px, rgb(226 232 240) 32px)',
                    backgroundSize: `100% ${CALENDAR_ROW_HEIGHT / 2}px`,
                  }}
                >
                  {renderedItems.map((item) => (
                    <CalendarCard
                      key={item.id}
                      item={item}
                      layout={layouts[item.id] || persistentLayouts[item.id]}
                      ghost={Boolean(item.proposalId) || Boolean(item.interactionPreview)}
                      hidden={item.id === interaction?.item.id}
                      deleting={deletingIds.has(item.id)}
                      editable={!item.proposalId && !item.interactionPreview && (
                        canDirectEditPlanItem(trip, item, user.uid) ||
                        canProposePlanChange(trip, item, user.uid)
                      )}
                      onOpen={openItem}
                      onInteractionStart={beginInteraction}
                      onSelectProposal={(key, proposalId) => setProposalSelection((current) => ({ ...current, [key]: proposalId }))}
                    />
                  ))}
                  {date === currentDate && (() => {
                    const minute = now.getHours() * 60 + now.getMinutes()
                    return <div className="pointer-events-none absolute inset-x-0 z-40 border-t-2 border-rose-500" style={{ top: (minute / 60) * CALENDAR_ROW_HEIGHT }} />
                  })()}
                </div>
              )
            })}
        </div>
      </CalendarScrollFrame>

      {!items.length && <div className="mt-5"><EmptyState title="Takvim boş" description="Boş bir saate çift tıkla veya Plan ekle düğmesini kullan." /></div>}

      {editor && (
        <PlanItemEditor
          trip={trip}
          user={user}
          item={editor.item}
          duplicateOf={editor.duplicateOf}
          key={editor.duplicateOf ? `duplicate-${editor.duplicateOf.id}` : editor.item?.id || 'new'}
          liveItem={items.find((item) => item.id === editor.item?.id) || editor.item}
          initialSlot={editor.initialSlot}
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
