import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Outlet, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { BudgetPage } from './BudgetPage'

const mocks = vi.hoisted(() => ({ updateExpense: vi.fn(), expenses: [] }))

vi.mock('../../profile/hooks/useProfilesById', () => ({
  useProfilesById: () => ({
    owner: { id: 'owner', displayName: 'Ada', username: 'ada' },
    friend: { id: 'friend', displayName: 'Berk', username: 'berk' },
  }),
}))

vi.mock('../data/expenseRepository', () => ({
  createExpense: vi.fn(),
  removeExpense: vi.fn(),
  updateExpense: mocks.updateExpense,
  subscribeToTripExpenses: (_tripId, _userId, callback) => {
    callback(mocks.expenses)
    return vi.fn()
  },
}))

describe('BudgetPage expense editing', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.expenses = [{
      id: 'expense-1', ownerId: 'owner', tripId: 'trip', title: 'Taksi', amount: 100,
      currency: 'TRY', visibility: 'private', kind: 'spent', category: 'transport',
    }]
  })

  it('lets the expense owner edit amount, currency, and visibility', async () => {
    render(
      <MemoryRouter initialEntries={['/budget']}>
        <Routes>
          <Route element={<Outlet context={{ trip: { id: 'trip', memberIds: ['owner'], settlementCurrency: 'TRY' }, user: { uid: 'owner' } }} />}>
            <Route path="budget" element={<BudgetPage />} />
          </Route>
        </Routes>
      </MemoryRouter>,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Düzenle' }))
    fireEvent.change(screen.getByLabelText('Tutar'), { target: { value: '250' } })
    fireEvent.change(screen.getByLabelText('Para birimi'), { target: { value: 'EUR' } })
    fireEvent.change(screen.getByLabelText('Harcama görünürlüğü'), { target: { value: 'profile' } })
    fireEvent.click(screen.getByRole('button', { name: 'Bütçe kalemini güncelle' }))

    await waitFor(() => expect(mocks.updateExpense).toHaveBeenCalledWith(
      'expense-1',
      expect.objectContaining({ amount: '250', currency: 'EUR', visibility: 'profile' }),
      'owner',
      expect.objectContaining({ id: 'trip', settlementCurrency: 'TRY' }),
    ))
  })

  it('shows who should pay whom for shared multi-currency expenses', () => {
    mocks.expenses = [{
      id: 'expense-1', ownerId: 'owner', tripId: 'trip', title: 'Akşam yemeği', amount: 100,
      currency: 'USD', visibility: 'trip', kind: 'spent', category: 'food',
      settlementCurrency: 'EUR', exchangeRate: 0.9, splitParticipantIds: ['owner', 'friend'],
    }]
    const { container } = render(
      <MemoryRouter initialEntries={['/budget']}>
        <Routes>
          <Route element={<Outlet context={{ trip: { id: 'trip', memberIds: ['owner', 'friend'], settlementCurrency: 'EUR' }, user: { uid: 'owner' } }} />}>
            <Route path="budget" element={<BudgetPage />} />
          </Route>
        </Routes>
      </MemoryRouter>,
    )

    expect(screen.getByText('Kim kime ne ödeyecek?')).toBeInTheDocument()
    expect(screen.getByText('45 EUR')).toBeInTheDocument()
    expect(container).toHaveTextContent('Berk')
    expect(container).toHaveTextContent('Ada')
  })
})
