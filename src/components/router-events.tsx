'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import NProgress from 'nprogress'

export function RouterEvents() {
  const router = useRouter()

  useEffect(() => {
    const handleStart = () => NProgress.start()
    const handleComplete = () => NProgress.done()

    // Override router push to show progress
    const originalPush = router.push
    router.push = (...args) => {
      handleStart()
      return originalPush.apply(router, args)
    }

    return () => {
      router.push = originalPush
    }
  }, [router])

  return null
}
