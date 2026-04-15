import { getInitials, formatRoleLabel } from '../utils/user'

export function UserProfileCard({ userName, userRole, userPhoto, collapsed }) {
  const initials = getInitials(userName)
  const roleLabel = formatRoleLabel(userRole)

  if (collapsed) {
    return (
      <div className="sidebarUserAvatarOnly">
        <div className="sidebarUserAvatar">
          {userPhoto ? (
            <img src={userPhoto} alt={userName} className="sidebarUserAvatarImg" />
          ) : (
            <span className="sidebarUserAvatarInitials">{initials}</span>
          )}
          <span className="sidebarUserOnlineDot" />
        </div>
      </div>
    )
  }

  return (
    <div className="sidebarUserCard">
      <div className="sidebarUserAvatar">
        {userPhoto ? (
          <img src={userPhoto} alt={userName} className="sidebarUserAvatarImg" />
        ) : (
          <span className="sidebarUserAvatarInitials">{initials}</span>
        )}
        <span className="sidebarUserOnlineDot" />
      </div>
      <div className="sidebarUserInfo">
        <span className="sidebarUserName">{userName}</span>
        {roleLabel && <span className="sidebarUserRole">{roleLabel}</span>}
      </div>
    </div>
  )
}
