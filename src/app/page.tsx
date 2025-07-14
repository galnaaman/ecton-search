import HomePageClient from "@/components/homepage-client"

interface App {
  id: string
  name: string
  icon: string
  url: string
  color: string
  order: number
}

interface DockItem {
  id: string
  title: string
  icon: string
  href: string
  order: number
}

async function getApps(): Promise<App[]> {
  try {
    // Import prisma directly for server-side data fetching
    const { prisma } = await import('@/lib/prisma')
    
    const apps = await prisma.app.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        icon: true,
        url: true,
        color: true,
        order: true
      },
      orderBy: { order: 'asc' }
    })

    return apps
  } catch (error) {
    console.error('Error fetching apps:', error)
    return []
  }
}

async function getDockItems(): Promise<DockItem[]> {
  try {
    // Import prisma directly for server-side data fetching
    const { prisma } = await import('@/lib/prisma')
    
    const dockItems = await prisma.dockItem.findMany({
      where: { isActive: true },
      select: {
        id: true,
        title: true,
        icon: true,
        href: true,
        order: true
      },
      orderBy: { order: 'asc' }
    })

    return dockItems
  } catch (error) {
    console.error('Error fetching dock items:', error)
    return []
  }
}

export default async function HomePage() {
  const [apps, dockItems] = await Promise.all([
    getApps(),
    getDockItems()
  ])

  return <HomePageClient apps={apps} dockItems={dockItems} />
}
