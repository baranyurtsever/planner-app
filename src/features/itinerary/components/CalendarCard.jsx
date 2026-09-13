import { CALENDAR_ROW_HEIGHT } from '../domain/calendarLayout'
import { PLAN_CATEGORY_MAP } from '../domain/planItem'
import { formatCalendarTimeLabel } from '../domain/planTime'

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

const statusLabels = {
  todo: 'Yapılacak',
  done: 'Tamamlandı',
  postponed: 'Ertelendi',
  cancelled: 'İptal edildi',
}

function timeLabel(minute) {
  return `${String(Math.floor(minute / 60)).padStart(2, '0')}:${String(minute % 60).padStart(2, '0')}`
}

export function CalendarCard({ item, layout, ghost = false, hidden = false, deleting = false, onOpen, onInteractionStart, editable, onSelectProposal }) {
  const category = PLAN_CATEGORY_MAP[item.category] || PLAN_CATEGORY_MAP.other
  const height = Math.max(18, ((item.endMinute - item.startMinute) / 60) * CALENDAR_ROW_HEIGHT)
  const displayTime = item.time?.kind === 'timed' ? formatCalendarTimeLabel(item.time) : `${timeLabel(item.startMinute)}–${timeLabel(item.endMinute)}`
  return (
    <article
      role="button"
      aria-hidden={hidden || undefined}
      tabIndex={0}
      title={`${item.title} · ${displayTime}`}
      onClick={(event) => { event.stopPropagation(); if (!ghost) onOpen(item) }}
      onKeyDown={(event) => { if ((event.key === 'Enter' || event.key === ' ') && !ghost) onOpen(item) }}
      onPointerDown={(event) => {
        if (!editable || ghost || event.button !== 0) return
        onInteractionStart(event, item, event.target.dataset.resizeEdge || 'move')
      }}
      className={`group absolute z-10 rounded-lg border px-2 py-1 text-left shadow-sm transition-shadow hover:z-30 hover:shadow-lg focus:z-30 focus:outline-none focus:ring-2 focus:ring-teal-500 ${categoryStyles[item.category] || categoryStyles.other} ${item.status === 'done' ? 'opacity-65' : ''} ${item.status === 'postponed' ? 'border-dashed' : ''} ${item.status === 'cancelled' ? 'line-through opacity-50' : ''} ${ghost ? 'border-dashed opacity-65' : ''} ${hidden ? 'invisible' : ''} ${deleting ? 'opacity-35 grayscale' : ''} ${editable ? 'cursor-grab touch-pan-y active:cursor-grabbing' : 'cursor-pointer'}`}
      style={{
        top: `${(item.startMinute / 60) * CALENDAR_ROW_HEIGHT}px`,
        height: `${height}px`,
        left: `calc(${layout.leftPercent}% + 1px)`,
        width: `calc(${layout.widthPercent}% - 2px)`,
      }}
    >
      {editable && <span data-resize-edge="start" className="absolute inset-x-0 top-0 h-2 cursor-ns-resize" />}
      <p className="truncate text-[10px] font-black">{ghost ? `ÖNERİ @${item.proposerId || '—'} · ` : ''}{layout.columnCount > 1 ? '⚠ ' : ''}{category.icon} {displayTime}</p>
      <h3 className="truncate text-xs font-black">{item.title}</h3>
      {ghost && item.proposalOptions?.length > 1 && (
        <select aria-label={`${item.title} önerileri`} value={item.proposalId} onClick={(event) => event.stopPropagation()} onChange={(event) => onSelectProposal(item.proposalGroupKey, event.target.value)} className="mt-1 max-w-full rounded border border-amber-500 bg-white/90 text-[10px] font-bold">
          {item.proposalOptions.map((option) => <option key={option.proposalId} value={option.proposalId}>@{option.proposerId}</option>)}
        </select>
      )}
      {height >= 48 && item.location?.name && <p className="truncate text-[10px] opacity-70">{item.location.name}</p>}
      <aside role="tooltip" aria-label={`${item.title} ayrıntıları`} className="absolute left-0 top-full z-50 mt-1 hidden min-w-56 rounded-xl bg-slate-950 p-3 text-xs font-medium normal-case text-white shadow-xl group-hover:block group-focus:block">
        <p className="font-black">{item.title}</p>
        <p>{displayTime} · {category.label} · {statusLabels[item.status] || item.status}</p>
        {item.location?.name && <p>{item.location.name}</p>}
        {item.notes && <p className="mt-1 text-slate-200">{item.notes}</p>}
      </aside>
      {editable && <span data-resize-edge="end" className="absolute inset-x-0 bottom-0 h-2 cursor-ns-resize" />}
    </article>
  )
}
