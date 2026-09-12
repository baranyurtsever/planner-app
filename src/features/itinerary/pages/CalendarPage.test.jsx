import { fireEvent, render, waitFor } from '@testing-library/react'
import { MemoryRouter, Outlet, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { CalendarPage } from './CalendarPage'

const mocks = vi.hoisted(() => ({ changePlanItem: vi.fn() }))

vi.mock('../data/planRepository', () => ({
  changePlanItem: mocks.changePlanItem,
  subscribeToPlanItems: (_tripId, _userId, callback) => {
    callback([{
      id: 'plan',
      scope: 'shared',
      ownerId: null,
      title: 'Akşam yemeği',
      category: 'food',
      status: 'todo',
      visibility: 'trip',
      notes: '',
      location: { name: '', mapUrl: '', lat: null, lng: null },
      time: {
        kind: 'timed',
        startsAt: '2026-09-12T09:00:00.000Z',
        endsAt: '2026-09-12T10:00:00.000Z',
        startTimeZone: 'Europe/Istanbul',
        endTimeZone: 'Europe/Istanbul',
      },
    }])
    return vi.fn()
  },
  subscribeToPlanProposals: (_tripId, callback) => {
    callback([])
    return vi.fn()
  },
}))

vi.mock('../components/PlanItemEditor', () => ({
  PlanItemEditor: () => <div data-testid="plan-editor" />,
}))

vi.mock('../components/ProposalPanel', () => ({
  ProposalPanel: () => null,
}))

const trip = {
  id: 'trip',
  ownerId: 'owner',
  memberIds: ['owner'],
  memberRoles: { owner: 'owner' },
}

describe('CalendarPage pointer interactions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.changePlanItem.mockResolvedValue({ kind: 'item' })
    window.matchMedia = vi.fn().mockReturnValue({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })
    HTMLElement.prototype.setPointerCapture = vi.fn()
  })

  it('keeps the capture owner mounted, commits an outside drop, and suppresses its click', async () => {
    const { container, queryByTestId } = render(
      <MemoryRouter initialEntries={['/calendar?date=2026-09-12']}>
        <Routes>
          <Route element={<Outlet context={{ trip, user: { uid: 'owner' } }} />}>
            <Route path="calendar" element={<CalendarPage />} />
          </Route>
        </Routes>
      </MemoryRouter>,
    )
    const board = container.querySelector('[data-testid="calendar-time-board"]')
    board.getBoundingClientRect = () => ({ top: 0, left: 0, width: 764, height: 1536 })
    const card = container.querySelector('article[title^="Akşam yemeği"]')

    fireEvent.pointerDown(card, { pointerId: 7, button: 0, clientX: 700, clientY: 770 })
    fireEvent.pointerMove(board, { pointerId: 7, clientX: 590, clientY: 850 })

    expect(container.querySelector('article[title^="Akşam yemeği"]')).toBe(card)

    fireEvent.pointerUp(board, { pointerId: 7, clientX: 900, clientY: 850 })
    await waitFor(() => expect(mocks.changePlanItem).toHaveBeenCalledOnce())
    fireEvent.click(card)
    expect(queryByTestId('plan-editor')).not.toBeInTheDocument()
  })

  it('cancels safely when the captured pointer is cancelled', () => {
    const { container } = render(
      <MemoryRouter initialEntries={['/calendar?date=2026-09-12']}>
        <Routes>
          <Route element={<Outlet context={{ trip, user: { uid: 'owner' } }} />}>
            <Route path="calendar" element={<CalendarPage />} />
          </Route>
        </Routes>
      </MemoryRouter>,
    )
    const board = container.querySelector('[data-testid="calendar-time-board"]')
    board.getBoundingClientRect = () => ({ top: 0, left: 0, width: 764, height: 1536 })
    const card = container.querySelector('article[title^="Akşam yemeği"]')
    fireEvent.pointerDown(card, { pointerId: 8, button: 0, clientX: 700, clientY: 770 })
    fireEvent.pointerCancel(board, { pointerId: 8 })
    expect(mocks.changePlanItem).not.toHaveBeenCalled()
  })
})
