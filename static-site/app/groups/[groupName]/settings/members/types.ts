export interface GroupMember {
  username: string,
  roles: string[]
}

export interface ErrorMessage {
  title: string,
  contents: string
}

export interface RemoveMemberModalProps {
  groupName: string,
  member: GroupMember,
  isOpen: boolean,
  onClose: () => void,
}

export interface SelectOption {
  value: string,
  label: string
}
