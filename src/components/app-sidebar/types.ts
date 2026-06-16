import type { LucideProps } from '@lucide/vue'
import type { FunctionalComponent } from 'vue'

export type NavIcon = FunctionalComponent<LucideProps, Record<any, any>, any, Record<any, any>>


// export type NavItem
//   = | BaseNavItem & {
//     items: (BaseNavItem & { url?: string })[]
//     url?: never
//     isActive?: boolean
//   } | BaseNavItem & {
//     url: string
//     items?: never
//   }


export interface Team {
  name: string
  logo: NavIcon
  plan: string
}

export interface MenuItem {
  title: string
  url?: string
  icon?: NavIcon
  items?: MenuItem[]
}
