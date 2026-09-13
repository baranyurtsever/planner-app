export function profileDisplayName(profile) {
  return profile?.displayName?.trim() || (profile?.username ? `@${profile.username}` : 'Peregrin kullanıcısı')
}
