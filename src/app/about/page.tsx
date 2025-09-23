import { AboutService } from '@/services'
import { AboutContent } from './content'

export default async function AboutPage() {
  // Use the new service architecture
  const { aboutPage, error } = await AboutService.getAboutPageData()

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Error Loading About</h1>
          <p className="text-neutral-400">{error}</p>
        </div>
      </div>
    )
  }

  return <AboutContent aboutPageData={aboutPage} press={[]} exhibitions={[]} />
}
