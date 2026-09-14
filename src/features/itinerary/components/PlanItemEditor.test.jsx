import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { PlanItemEditor } from './PlanItemEditor'

const mocks = vi.hoisted(() => ({
  createExpense: vi.fn(),
  isPlanParticipant: vi.fn(),
  requestPlanParticipation: vi.fn(),
  savePlanItem: vi.fn(),
  saveOwnPlanDetails: vi.fn(),
  getProfileById: vi.fn(),
  createPlanDocument: vi.fn(),
}))

vi.mock('../../profile/data/profileRepository', () => ({
  getProfileById: mocks.getProfileById,
  getProfileByUsername: vi.fn(),
}))

vi.mock('../data/planRepository', () => ({
  savePlanItem: mocks.savePlanItem,
}))

vi.mock('../data/planDocumentRepository', () => ({
  createPlanDocument: mocks.createPlanDocument,
  removePlanDocument: vi.fn(),
  updatePlanDocument: vi.fn(),
  subscribeToPlanDocuments: (_tripId, _itemId, _userId, callback) => {
    callback([])
    return vi.fn()
  },
}))

vi.mock('../data/planParticipationRepository', () => ({
  decideParticipationRequest: vi.fn(),
  includePlanParticipant: vi.fn(),
  isPlanParticipant: mocks.isPlanParticipant,
  leavePlanItem: vi.fn(),
  requestPlanParticipation: mocks.requestPlanParticipation,
  saveOwnPlanDetails: mocks.saveOwnPlanDetails,
  subscribeToOwnPlanDetails: (_tripId, _itemId, _userId, callback) => {
    callback({ note: '', links: [] })
    return vi.fn()
  },
  subscribeToParticipationRequests: (_tripId, callback) => {
    callback([])
    return vi.fn()
  },
}))

vi.mock('../../expenses/data/expenseRepository', () => ({
  createExpense: mocks.createExpense,
  removeExpense: vi.fn(),
  subscribeToTripExpenses: (_tripId, _userId, callback) => {
    callback([])
    return vi.fn()
  },
}))

const trip = {
  id: 'trip',
  ownerId: 'owner',
  memberIds: ['owner'],
  memberRoles: { owner: 'owner' },
  defaultTimeZone: 'Asia/Bangkok',
}

const item = {
  id: 'plan',
  scope: 'shared',
  ownerId: null,
  title: 'Akşam yemeği',
  category: 'food',
  status: 'todo',
  visibility: 'trip',
  notes: '',
  location: { name: '', mapUrl: '', lat: null, lng: null },
  time: { kind: 'date', localDate: '2026-09-12' },
  participantIds: [],
  excludedParticipantIds: [],
  blockedParticipantIds: [],
}

describe('PlanItemEditor form boundaries', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.isPlanParticipant.mockReturnValue(true)
    mocks.getProfileById.mockResolvedValue({ id: 'owner', displayName: 'Ada Lovelace', username: 'ada' })
  })

  it('saves personal details without submitting the plan item form', async () => {
    const { container } = render(
      <PlanItemEditor
        trip={trip}
        item={item}
        user={{ uid: 'owner' }}
        onClose={vi.fn()}
      />,
    )

    fireEvent.change(screen.getByPlaceholderText('Kişisel not'), {
      target: { value: 'Bana özel not' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Kişisel bilgileri kaydet' }))

    await waitFor(() => expect(mocks.saveOwnPlanDetails).toHaveBeenCalledOnce())
    expect(mocks.savePlanItem).not.toHaveBeenCalled()
    expect(container.querySelectorAll('form form')).toHaveLength(0)
    expect(await screen.findByText('Ada Lovelace')).toBeInTheDocument()
    expect(screen.queryByText('owner')).not.toBeInTheDocument()
  })

  it('adds a private reservation without submitting the plan item form', async () => {
    render(<PlanItemEditor trip={trip} item={item} user={{ uid: 'owner' }} onClose={vi.fn()} />)

    fireEvent.change(screen.getByLabelText('Belge başlığı'), { target: { value: 'Otel onayı' } })
    fireEvent.change(screen.getByLabelText('Rezervasyon numarası'), { target: { value: 'ABC-123' } })
    fireEvent.click(screen.getByRole('button', { name: 'Belge ekle' }))

    await waitFor(() => expect(mocks.createPlanDocument).toHaveBeenCalledWith(
      'trip',
      'plan',
      'owner',
      expect.objectContaining({ title: 'Otel onayı', reservationCode: 'ABC-123', visibility: 'private' }),
    ))
    expect(mocks.savePlanItem).not.toHaveBeenCalled()
  })

  it('rolls a late initial slot end into the next day and allows any minute', () => {
    render(
      <PlanItemEditor
        trip={trip}
        initialSlot={{ localDate: '2026-09-12', startMinute: 23 * 60 + 45 }}
        user={{ uid: 'owner' }}
        onClose={vi.fn()}
      />,
    )

    expect(screen.getByLabelText('Başlangıç')).toHaveValue('2026-09-12T23:45')
    expect(screen.getByLabelText('Bitiş')).toHaveValue('2026-09-13T00:45')
    expect(screen.getByLabelText('Başlangıç')).toHaveAttribute('step', '60')
    expect(screen.getByLabelText('Başlangıç saat dilimi').tagName).toBe('SELECT')
    expect(screen.getByLabelText('Bitiş saat dilimi').tagName).toBe('SELECT')
    expect(screen.getByLabelText('Başlangıç saat dilimi')).toHaveValue('Asia/Bangkok')
    expect(screen.getByLabelText('Bitiş saat dilimi')).toHaveValue('Asia/Bangkok')
    expect(screen.getAllByRole('option', { name: /UTC[+-]\d{2}:\d{2} —/ }).length).toBeGreaterThan(0)
  })

  it('closes the modal with Escape', () => {
    const onClose = vi.fn()
    render(<PlanItemEditor trip={trip} item={item} user={{ uid: 'owner' }} onClose={onClose} />)

    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' })
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('saves the travel mode and estimated duration from the previous plan', async () => {
    mocks.savePlanItem.mockResolvedValue({ kind: 'item', id: 'plan' })
    const { container } = render(<PlanItemEditor trip={trip} item={item} user={{ uid: 'owner' }} onClose={vi.fn()} />)

    fireEvent.change(screen.getByLabelText('Ulaşım şekli'), { target: { value: 'transit' } })
    fireEvent.change(screen.getByLabelText('Tahmini ulaşım süresi'), { target: { value: '35' } })
    fireEvent.submit(container.querySelector('#plan-item-editor-form'))

    await waitFor(() => expect(mocks.savePlanItem).toHaveBeenCalledWith(
      trip,
      expect.objectContaining({ travelFromPrevious: { mode: 'transit', durationMinutes: 35 } }),
      'owner',
    ))
  })

  it('accepts any whole-minute estimate and allows the duration to stay empty', async () => {
    mocks.savePlanItem.mockResolvedValue({ kind: 'item', id: 'plan' })
    const { container } = render(<PlanItemEditor trip={trip} item={item} user={{ uid: 'owner' }} onClose={vi.fn()} />)
    const duration = screen.getByLabelText('Tahmini ulaşım süresi')

    fireEvent.change(screen.getByLabelText('Ulaşım şekli'), { target: { value: 'drive' } })
    fireEvent.change(duration, { target: { value: '45' } })
    expect(duration).toBeValid()
    expect(duration).not.toBeRequired()

    fireEvent.change(duration, { target: { value: '' } })
    fireEvent.submit(container.querySelector('#plan-item-editor-form'))
    await waitFor(() => expect(mocks.savePlanItem).toHaveBeenCalledWith(
      trip,
      expect.objectContaining({ travelFromPrevious: { mode: 'drive', durationMinutes: 0 } }),
      'owner',
    ))
  })

  it('duplicates a plan as a new sanitized item', async () => {
    mocks.savePlanItem.mockResolvedValue({ kind: 'item', id: 'copy' })
    render(
      <PlanItemEditor
        trip={trip}
        duplicateOf={{ ...item, notes: 'Kopyalanmaması gereken not', excludedParticipantIds: ['viewer'] }}
        user={{ uid: 'owner' }}
        onClose={vi.fn()}
      />,
    )

    expect(screen.getByRole('heading', { name: 'Plan Öğesini çoğalt' })).toBeInTheDocument()
    expect(screen.getByLabelText('Başlık')).toHaveValue('Akşam yemeği (kopya)')
    expect(screen.getByLabelText('Not')).toHaveValue('')
    fireEvent.click(screen.getByRole('button', { name: 'Kaydet' }))

    await waitFor(() => expect(mocks.savePlanItem).toHaveBeenCalledWith(
      trip,
      expect.objectContaining({ id: undefined, title: 'Akşam yemeği (kopya)', notes: '', excludedParticipantIds: [] }),
      'owner',
    ))
  })

  it('adds a linked expense without submitting the plan item form', async () => {
    render(
      <PlanItemEditor trip={trip} item={item} user={{ uid: 'owner' }} onClose={vi.fn()} />,
    )

    fireEvent.change(screen.getByPlaceholderText('Harcama'), { target: { value: 'Taksi' } })
    fireEvent.change(screen.getByPlaceholderText('Tutar'), { target: { value: '250' } })
    fireEvent.click(screen.getByRole('button', { name: 'Ekle' }))

    await waitFor(() => expect(mocks.createExpense).toHaveBeenCalledOnce())
    expect(mocks.savePlanItem).not.toHaveBeenCalled()
  })

  it('requests participation without submitting the plan item form', async () => {
    mocks.isPlanParticipant.mockReturnValue(false)
    render(
      <PlanItemEditor
        trip={trip}
        item={{ ...item, scope: 'personal', ownerId: 'someone-else' }}
        user={{ uid: 'owner' }}
        onClose={vi.fn()}
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Katılım isteği gönder' }))

    await waitFor(() => expect(mocks.requestPlanParticipation).toHaveBeenCalledOnce())
    expect(mocks.savePlanItem).not.toHaveBeenCalled()
  })

  it('does not let the creator leave a shared plan item', async () => {
    render(
      <PlanItemEditor
        trip={trip}
        item={{ ...item, createdBy: 'owner' }}
        user={{ uid: 'owner' }}
        onClose={vi.fn()}
      />,
    )

    expect(screen.queryByRole('button', { name: 'Bu plandan ayrıl' })).not.toBeInTheDocument()
  })
})
