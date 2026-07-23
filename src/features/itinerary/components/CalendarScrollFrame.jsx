export function CalendarScrollFrame({ scrollRef, header, allDay, children }) {
  return (
    <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <div ref={scrollRef} data-testid="calendar-scroll-frame" className="max-h-[70vh] overflow-y-auto">
        <div className="sticky top-0 z-50 bg-white">
          {header}
          {allDay}
        </div>
        {children}
      </div>
    </div>
  )
}
