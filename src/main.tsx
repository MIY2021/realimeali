import { createRoot } from 'react-dom/client'
import { Capacitor } from '@capacitor/core'
import { App as CapacitorApp } from '@capacitor/app'
import { Browser } from '@capacitor/browser'
import { supabase } from './integrations/supabase/client'
import App from './App.tsx'
import './index.css'

// OAuth and email magic links return to this app through the realimeali:// scheme.
if (Capacitor.isNativePlatform()) {
  void CapacitorApp.addListener('appUrlOpen', async ({ url }) => {
    try {
      const callbackUrl = new URL(url)
      const hashParams = new URLSearchParams(callbackUrl.hash.slice(1))
      const errorDescription =
        callbackUrl.searchParams.get('error_description') ??
        hashParams.get('error_description')
      if (errorDescription) throw new Error(errorDescription)

      const code = callbackUrl.searchParams.get('code')
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code)
        if (error) throw error
      } else {
        const access_token = hashParams.get('access_token')
        const refresh_token = hashParams.get('refresh_token')
        if (access_token && refresh_token) {
          const { error } = await supabase.auth.setSession({ access_token, refresh_token })
          if (error) throw error
        }
      }

      await Browser.close().catch(() => undefined)
      window.history.replaceState({}, '', '/')
    } catch (error) {
      console.error('Native authentication callback failed:', error)
      await Browser.close().catch(() => undefined)
    }
  })
}

createRoot(document.getElementById("root")!).render(<App />);
