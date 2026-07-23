import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { TripCreateForm } from './TripCreateForm'

describe('TripCreateForm', () => {
  it('submits the trip creation fields', async () => {
    const onSubmit = vi.fn().mockResolvedValue()
    render(<TripCreateForm onSubmit={onSubmit} />)

    fireEvent.change(screen.getByLabelText('Gezi adı'), { target: { value: 'Roma' } })
    fireEvent.change(screen.getByLabelText('Konum'), { target: { value: 'İtalya' } })
    fireEvent.change(screen.getByLabelText('Gezi görünürlüğü'), { target: { value: 'profile' } })
    fireEvent.click(screen.getByRole('button', { name: 'Oluştur' }))

    expect(onSubmit).toHaveBeenCalledWith({
      name: 'Roma',
      locationName: 'İtalya',
      visibility: 'profile',
    })
  })
})
