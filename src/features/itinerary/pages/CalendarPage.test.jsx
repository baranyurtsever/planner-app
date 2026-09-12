import { fireEvent, render, waitFor } from '@testing-library/react'
import { MemoryRouter, Outlet, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { CalendarPage } from './CalendarPage'

const mocks = vi.hoisted(() => ({ changePlanItem: vi.fn(), proposals: [] }))

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
    callback(mocks.proposals)
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
    mocks.proposals = []
    window.matchMedia = vi.fn().mockReturnValue({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })
    HTMLElement.prototype.setPointerCapture = vi.fn()
  })

  it('shows an all-day proposal ghost with its proposer', () => {
    mocks.proposals = [{
      id: 'proposal',
      targetItemId: 'new-plan',
      proposerId: 'editor',
      action: 'create',
      patch: {
        title: 'Ada turu',
        category: 'activity',
        time: { kind: 'date', localDate: '2026-09-12' },
      },
    }]
    const { getByText } = render(
      <MemoryRouter initialEntries={['/calendar?date=2026-09-12']}>
        <Routes>
          <Route element={<Outlet context={{ trip, user: { uid: 'owner' } }} />}>
            <Route path="calendar" element={<CalendarPage />} />
          </Route>
        </Routes>
      </MemoryRouter>,
    )

    expect(getByText(/ÖNERİ @editor.*Ada turu/)).toBeInTheDocument()
  })

  it('groups all-day proposals for the same Plan Item into one selectable ghost', () => {
    mocks.proposals = ['editor-a', 'editor-b'].map((proposerId, index) => ({
      id: `all-day-proposal-${index}`,
      targetItemId: 'new-plan',
      proposerId,
      action: 'create',
      patch: {
        title: index ? 'Müze günü' : 'Ada turu',
        category: 'activity',
        time: { kind: 'date', localDate: '2026-09-12' },
      },
    }))
    const { getByLabelText, getByText } = render(
      <MemoryRouter initialEntries={['/calendar?date=2026-09-12']}>
        <Routes>
          <Route element={<Outlet context={{ trip, user: { uid: 'owner' } }} />}>
            <Route path="calendar" element={<CalendarPage />} />
          </Route>
        </Routes>
      </MemoryRouter>,
    )

    const selector = getByLabelText('new-plan önerileri')
    expect(selector.options).toHaveLength(2)
    fireEvent.change(selector, { target: { value: 'all-day-proposal-1' } })
    expect(selector).toHaveValue('all-day-proposal-1')
    expect(getByText(/ÖNERİ @editor-b.*Müze günü/)).toBeInTheDocument()
  })

  it('groups timed proposals for the same item into one selectable ghost', () => {
    mocks.proposals = ['editor-a', 'editor-b'].map((proposerId, index) => ({
      id: `proposal-${index}`,
      targetItemId: 'plan',
      proposerId,
      action: 'update',
      patch: {
        time: {
          kind: 'timed',
          startsAt: `2026-09-12T${index ? '11' : '10'}:00:00.000Z`,
          endsAt: `2026-09-12T${index ? '12' : '11'}:00:00.000Z`,
          startTimeZone: 'Europe/Istanbul',
          endTimeZone: 'Europe/Istanbul',
        },
      },
    }))
    const { getByLabelText } = render(
      <MemoryRouter initialEntries={['/calendar?date=2026-09-12']}>
        <Routes>
          <Route element={<Outlet context={{ trip, user: { uid: 'owner' } }} />}>
            <Route path="calendar" element={<CalendarPage />} />
          </Route>
        </Routes>
      </MemoryRouter>,
    )

    const selector = getByLabelText('Akşam yemeği önerileri')
    expect(selector.options).toHaveLength(2)
    fireEvent.change(selector, { target: { value: 'proposal-1' } })
    expect(selector).toHaveValue('proposal-1')
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

  it('keeps touch scrolling available until a card long press activates', () => {
    const { container } = render(
      <MemoryRouter initialEntries={['/calendar?date=2026-09-12']}>
        <Routes>
          <Route element={<Outlet context={{ trip, user: { uid: 'owner' } }} />}>
            <Route path="calendar" element={<CalendarPage />} />
          </Route>
        </Routes>
      </MemoryRouter>,
    )
    const card = container.querySelector('article[title^="Akşam yemeği"]')
    fireEvent.pointerDown(card, { pointerId: 9, pointerType: 'touch', button: 0, clientX: 700, clientY: 770 })

    expect(card).toHaveClass('touch-pan-y')
    expect(HTMLElement.prototype.setPointerCapture).not.toHaveBeenCalled()
  })

  it('offers retry after a failed calendar write', async () => {
    mocks.changePlanItem.mockRejectedValueOnce(new Error('Bağlantı kesildi')).mockResolvedValueOnce({ kind: 'item' })
    const { container, getByRole } = render(
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
    fireEvent.pointerDown(card, { pointerId: 10, button: 0, clientX: 700, clientY: 770 })
    fireEvent.pointerMove(board, { pointerId: 10, clientX: 590, clientY: 850 })
    fireEvent.pointerUp(board, { pointerId: 10, clientX: 590, clientY: 850 })

    const retry = await waitFor(() => getByRole('button', { name: 'Yeniden dene' }))
    fireEvent.click(retry)
    await waitFor(() => expect(mocks.changePlanItem).toHaveBeenCalledTimes(2))
  })

  it('opens creation from an empty calendar slot', () => {
    const { container, getByTestId } = render(
      <MemoryRouter initialEntries={['/calendar?date=2026-09-12']}>
        <Routes>
          <Route element={<Outlet context={{ trip, user: { uid: 'owner' } }} />}>
            <Route path="calendar" element={<CalendarPage />} />
          </Route>
        </Routes>
      </MemoryRouter>,
    )
    const day = container.querySelector('[data-testid="calendar-time-board"]').children[1]
    day.getBoundingClientRect = () => ({ top: 0 })
    fireEvent.doubleClick(day, { clientY: 640 })
    expect(getByTestId('plan-editor')).toBeInTheDocument()
  })

  it('commits an end-edge resize through the repository', async () => {
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
    const handle = container.querySelector('[data-resize-edge="end"]')
    fireEvent.pointerDown(handle, { pointerId: 11, button: 0, clientX: 700, clientY: 830 })
    fireEvent.pointerMove(board, { pointerId: 11, clientX: 700, clientY: 900 })
    fireEvent.pointerUp(board, { pointerId: 11, clientX: 700, clientY: 900 })

    await waitFor(() => expect(mocks.changePlanItem).toHaveBeenCalledWith(
      trip,
      expect.objectContaining({ id: 'plan' }),
      'owner',
      expect.objectContaining({ time: expect.objectContaining({ endsAt: '2026-09-12T11:00:00.000Z' }) }),
    ))
  })

  it('shows a direct move optimistically and rolls it back on failure', async () => {
    let rejectWrite
    mocks.changePlanItem.mockReturnValue(new Promise((_resolve, reject) => { rejectWrite = reject }))
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
    const originalTitle = 'Akşam yemeği · 12:00–13:00'
    const card = container.querySelector(`article[title="${originalTitle}"]`)
    fireEvent.pointerDown(card, { pointerId: 12, button: 0, clientX: 700, clientY: 770 })
    fireEvent.pointerMove(board, { pointerId: 12, clientX: 590, clientY: 850 })
    fireEvent.pointerUp(board, { pointerId: 12, clientX: 590, clientY: 850 })

    await waitFor(() => expect(container.querySelector(`article[title="${originalTitle}"]`)).not.toBeInTheDocument())
    rejectWrite(new Error('Bağlantı kesildi'))
    await waitFor(() => expect(container.querySelector(`article[title="${originalTitle}"]`)).toBeInTheDocument())
  })
})
