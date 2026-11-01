import { useEffect, useState } from 'react'

export function useIsMobile(): boolean {
 const [isMobile, setIsMobile] = useState<boolean>(() => {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false
  return window.matchMedia('(max-width: 600px)').matches
 })

 useEffect(() => {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return
  const mql = window.matchMedia('(max-width: 600px)')
  const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches)
  setIsMobile(mql.matches)
  if (mql.addEventListener) {
   mql.addEventListener('change', handler)
   return () => mql.removeEventListener('change', handler)
  }
  mql.addListener(handler)
  return () => mql.removeListener(handler)
 }, [])

 return isMobile
}
