"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { useMemo } from "react"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

export function Breadcrumbs() {
  const pathname = usePathname()

  const segments = useMemo(() => {
    const parts = pathname.split("/").filter(Boolean)
    return parts.map((part, index) => {
      const href = "/" + parts.slice(0, index + 1).join("/")
      const label = part.charAt(0).toUpperCase() + part.slice(1)
      return { label, href, isLast: index === parts.length - 1 }
    })
  }, [pathname])

  if (segments.length === 0) return null

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {segments.flatMap((s, index) => [
          index > 0 && <BreadcrumbSeparator key={`sep-${index}`} />,
          <BreadcrumbItem key={s.href}>
            {s.isLast ? (
              <BreadcrumbPage>{s.label}</BreadcrumbPage>
            ) : (
              <BreadcrumbLink render={<Link href={s.href} />}>
                {s.label}
              </BreadcrumbLink>
            )}
          </BreadcrumbItem>,
        ])}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
