import { PropsWithChildren } from 'react'
import Link, { LinkProps } from 'next/link'

export const InternalLink = (props: PropsWithChildren<LinkProps>) => {
  return (
    <Link {...props}>
      {props.children}
    </Link>
  )
}
