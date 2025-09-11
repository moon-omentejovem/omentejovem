import { Newsletter } from './content'
import { ServerImageBanner } from './ServerImageBanner'

export default async function NewsletterPage() {
  return (
    <div className="relative z-50 bg-background">
      <ServerImageBanner />
      <Newsletter />
    </div>
  )
}
