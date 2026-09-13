import { useEffect, useState } from 'react'
import { getProfileById } from '../data/profileRepository'

export function useProfilesById(userIds) {
  const userIdsKey = userIds.filter(Boolean).join('|')
  const [profilesById, setProfilesById] = useState({})

  useEffect(() => {
    let active = true
    const uniqueIds = Array.from(new Set(userIdsKey.split('|').filter(Boolean)))

    Promise.all(uniqueIds.map(async (userId) => {
      try {
        return [userId, await getProfileById(userId)]
      } catch {
        return [userId, null]
      }
    })).then((entries) => {
      if (active) setProfilesById(Object.fromEntries(entries))
    })

    return () => {
      active = false
    }
  }, [userIdsKey])

  return profilesById
}
