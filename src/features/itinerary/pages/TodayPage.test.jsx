import { render, screen } from '@testing-library/react'
import { MemoryRouter, Outlet, Route, Routes } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { TodayPage } from './TodayPage'

vi.mock('../data/planRepository', () => ({
  subscribeToPlanItems: (_tripId, _userId, callback) => {
    const startsAt = new Date(Date.now() + 30 * 60 * 1000).toISOString()
    const endsAt = new Date(Date.now() + 90 * 60 * 1000).toISOString()
    callback([
      {
        id: 'next', title: 'Havaalanına git', category: 'transport', scope: 'shared',
        visibility: 'trip', excludedParticipantIds: [], location: { name: 'IST', mapUrl: '' },
        time: { kind: 'timed', startsAt, endsAt, startTimeZone: 'Europe/Istanbul', endTimeZone: 'Europe/Istanbul' },
      },
      {
        id: 'excluded', title: 'Katılmadığım yemek', category: 'food', scope: 'shared',
        visibility: 'trip', excludedParticipantIds: ['viewer'], location: {},
        time: { kind: 'timed', startsAt, endsAt, startTimeZone: 'Europe/Istanbul', endTimeZone: 'Europe/Istanbul' },
      },
    ])
    return vi.fn()
  },
}))

vi.mock('../../preparation/data/preparationRepository', () => ({
  subscribeToPreparationItems: (_tripId, _userId, callback) => {
    callback([{ id: 'passport', text: 'Pasaportu kontrol et', completed: false }])
    return vi.fn()
  },
}))

describe('TodayPage', () => {
  it('shows only participating plans and pending personal preparations', async () => {
    render(
      <MemoryRouter initialEntries={['/today']}>
        <Routes>
          <Route element={<Outlet context={{ trip: { id: 'trip', defaultTimeZone: 'Europe/Istanbul' }, user: { uid: 'viewer' } }} />}>
            <Route path="today" element={<TodayPage />} />
          </Route>
        </Routes>
      </MemoryRouter>,
    )

    expect((await screen.findAllByText('Havaalanına git')).length).toBeGreaterThan(0)
    expect(screen.queryByText('Katılmadığım yemek')).not.toBeInTheDocument()
    expect(screen.getByText(/Pasaportu kontrol et/)).toBeInTheDocument()
  })
})
