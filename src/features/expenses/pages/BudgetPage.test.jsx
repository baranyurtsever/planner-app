import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Outlet, Route, Routes } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { BudgetPage } from './BudgetPage'

const mocks = vi.hoisted(() => ({ updateExpense: vi.fn() }))

vi.mock('../data/expenseRepository', () => ({
  createExpense: vi.fn(),
  removeExpense: vi.fn(),
  updateExpense: mocks.updateExpense,
  subscribeToTripExpenses: (_tripId, _userId, callback) => {
    callback([{
      id: 'expense-1', ownerId: 'owner', tripId: 'trip', title: 'Taksi', amount: 100,
      currency: 'TRY', visibility: 'private', kind: 'spent', category: 'transport',
    }])
    return vi.fn()
  },
}))

describe('BudgetPage expense editing', () => {
  it('lets the expense owner edit amount, currency, and visibility', async () => {
    render(
      <MemoryRouter initialEntries={['/budget']}>
        <Routes>
          <Route element={<Outlet context={{ trip: { id: 'trip' }, user: { uid: 'owner' } }} />}>
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

    await waitFor(() => expect(mocks.updateExpense).toHaveBeenCalledWith('expense-1', expect.objectContaining({
      amount: '250', currency: 'EUR', visibility: 'profile',
    })))
  })
})
