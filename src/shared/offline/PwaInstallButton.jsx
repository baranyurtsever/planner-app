import { useEffect, useState } from 'react'

export function PwaInstallButton() {
  const [prompt, setPrompt] = useState(null)
  useEffect(() => {
    const capture = (event) => {
      event.preventDefault()
      setPrompt(event)
    }
    window.addEventListener('beforeinstallprompt', capture)
    return () => window.removeEventListener('beforeinstallprompt', capture)
  }, [])
  if (!prompt) return null
  return <button type="button" onClick={async () => { await prompt.prompt(); setPrompt(null) }} className="rounded-full border border-teal-200 px-3 py-2 text-xs font-bold text-teal-800">Uygulamayı yükle</button>
}
