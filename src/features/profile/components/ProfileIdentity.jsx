import { profileDisplayName } from '../domain/profileIdentity'

export function ProfileIdentity({ profile, compact = false }) {
  const displayName = profileDisplayName(profile)
  const showUsername = profile?.username && displayName !== `@${profile.username}`

  if (compact) {
    return <>{displayName}</>
  }

  return (
    <div>
      <p className="text-sm font-semibold">{displayName}</p>
      {showUsername && <p className="text-xs text-teal-700">@{profile.username}</p>}
    </div>
  )
}
