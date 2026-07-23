import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { AuthForm } from './AuthForm'

describe('AuthForm', () => {
  it('submits the login entry fields', async () => {
    const onSubmit = vi.fn().mockResolvedValue()
    render(<AuthForm mode="login" onSubmit={onSubmit} />)

    fireEvent.change(screen.getByLabelText('E-posta'), { target: { value: 'ada@example.com' } })
    fireEvent.change(screen.getByLabelText('Şifre'), { target: { value: 'secret123' } })
    fireEvent.click(screen.getByRole('button', { name: 'Giriş yap' }))

    expect(onSubmit).toHaveBeenCalledWith({
      email: 'ada@example.com',
      password: 'secret123',
    })
  })

  it('shows a useful message instead of the raw invalid-credential error', async () => {
    const error = Object.assign(new Error('Firebase: Error (auth/invalid-credential).'), {
      code: 'auth/invalid-credential',
    })
    render(<AuthForm mode="login" onSubmit={vi.fn().mockRejectedValue(error)} />)

    fireEvent.change(screen.getByLabelText('E-posta'), { target: { value: 'ada@example.com' } })
    fireEvent.change(screen.getByLabelText('Şifre'), { target: { value: 'wrong-password' } })
    fireEvent.click(screen.getByRole('button', { name: 'Giriş yap' }))

    expect(await screen.findByText('E-posta veya şifre hatalı.')).toBeInTheDocument()
    expect(screen.queryByText(/Firebase:/)).not.toBeInTheDocument()
  })

  it('requests a password reset for the entered email', async () => {
    const onResetPassword = vi.fn().mockResolvedValue()
    render(
      <AuthForm
        mode="login"
        onSubmit={vi.fn()}
        onResetPassword={onResetPassword}
      />,
    )

    fireEvent.change(screen.getByLabelText('E-posta'), { target: { value: 'ada@example.com' } })
    fireEvent.click(screen.getByRole('button', { name: 'Şifremi unuttum' }))

    await waitFor(() => expect(onResetPassword).toHaveBeenCalledWith('ada@example.com'))
    expect(
      await screen.findByText(
        'Bu adres kayıtlıysa şifre sıfırlama bağlantısı e-posta adresine gönderildi.',
      ),
    ).toBeInTheDocument()
  })

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
