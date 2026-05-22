import { ReactNode } from 'react'
import UserNavbar from './components/UserNavbar'

export default function UserLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-light-bg dark:bg-noir-950">
      <UserNavbar />
      <main className="max-w-7xl mx-auto px-6 py-8">
        {children}
      </main>
    </div>
  )
}