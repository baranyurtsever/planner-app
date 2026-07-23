import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { CalendarScrollFrame } from './CalendarScrollFrame'

describe('CalendarScrollFrame', () => {
  it('keeps headers and the time board inside the same scrollbar width', () => {
    render(
      <CalendarScrollFrame
        header={<div data-testid="calendar-header" />}
        allDay={<div data-testid="calendar-all-day" />}
      >
        <div data-testid="calendar-time-board" />
      </CalendarScrollFrame>,
    )

    const scrollFrame = screen.getByTestId('calendar-scroll-frame')
    expect(scrollFrame).toContainElement(screen.getByTestId('calendar-header'))
    expect(scrollFrame).toContainElement(screen.getByTestId('calendar-all-day'))
    expect(scrollFrame).toContainElement(screen.getByTestId('calendar-time-board'))
  })
})
