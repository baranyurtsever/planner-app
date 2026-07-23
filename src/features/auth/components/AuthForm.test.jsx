import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { AuthForm } from './AuthForm'

describe('AuthForm', () => {
  it('submits the public registration fields through its form interface', async () => {
    const onSubmit = vi.fn().mockResolvedValue()
    render(<AuthForm mode="register" onSubmit={onSubmit} />)

    fireEvent.change(screen.getByLabelText('Ad soyad'), { target: { value: 'Ada Lovelace' } })
    fireEvent.change(screen.getByLabelText('Kullanıcı adı'), { target: { value: 'ada' } })
    fireEvent.change(screen.getByLabelText('E-posta'), { target: { value: 'ada@example.com' } })
    fireEvent.change(screen.getByLabelText('Şifre'), { target: { value: 'secret123' } })
    fireEvent.click(screen.getByRole('button', { name: 'Hesap oluştur' }))

    expect(onSubmit).toHaveBeenCalledWith({
      displayName: 'Ada Lovelace',
      username: 'ada',
      email: 'ada@example.com',
      password: 'secret123',
    })
  })
})
