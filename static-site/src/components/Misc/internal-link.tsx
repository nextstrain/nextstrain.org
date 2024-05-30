import { PropsWithChildren, AnchorHTMLAttributes } from 'react'

export const InternalLink = (props: PropsWithChildren<AnchorHTMLAttributes<HTMLAnchorElement>>) => {
  return (
    <a {...props}>
      {props.children}
    </a>
  )
}
