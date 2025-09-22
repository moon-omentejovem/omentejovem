'use client'

import type { ReactElement } from 'react'

import { aboutAnimations } from '@/animations/client'
import { useEffect, useState } from 'react'

import { cn } from '@/lib/utils'
import Cookies from 'js-cookie'
import './style.css'

const KIT_API_KEY =
  process.env.NEXT_PUBLIC_KIT_API_KEY || 'kit_af59c54039b362cacce7f0f13aec4b6f'

interface SubscriberData {
  email_address: string
  state: 'active'
  fields?: {
    // Add any custom fields you want to collect
    Source?: string
  }
}

export function Newsletter(): ReactElement {
  const [email, setEmail] = useState('')
  const [isSubmitted, setIsSubmitted] = useState(false)
  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  const [isHidden, setIsHidden] = useState(false)

  useEffect(() => {
    // Check for existing cookie on component mount
    const hasUserDismissed = Cookies.get('newsletter_dismissed')
    if (hasUserDismissed) {
      setIsHidden(true)
    }
  }, [])

  const handleDismiss = () => {
    if (email?.length > 0) {
      // Set cookie for 7 days
      Cookies.set('newsletter_dismissed', 'true', { expires: 7 })
      setIsHidden(true)
    } else {
      setIsHidden(true)
    }
  }

  const handleSubmit = async () => {
    if (isValidEmail) {
      try {
        const subscriberData: SubscriberData = {
          email_address: email,
          state: 'active',
          fields: {
            Source: 'newsletter page'
          }
        }

        const response = await fetch('https://api.kit.com/v4/subscribers', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            'X-Kit-Api-Key': KIT_API_KEY
          },
          body: JSON.stringify(subscriberData)
        })

        if (!response.ok) {
          throw new Error('Failed to subscribe')
        }

        setIsSubmitted(true)
        setEmail('')
        handleDismiss()

        // refresh page
        window.location.reload()

        setTimeout(() => {
          setIsSubmitted(false)
        }, 3000)
      } catch (error) {
        console.error('Error subscribing:', error)
        // You might want to add error state handling here
      }
    }
  }

  useEffect(() => {
    aboutAnimations()
  }, [])

  if (isHidden) {
    return <></>
  }

  return (
    <main
      id="about-page"
      className="fixed max-w-[1920px] z-40 mx-auto top-0 h-full w-full sm:p-0 p-8 flex flex-col bg-background justify-center"
    >
      <button
        onClick={handleDismiss}
        className="absolute top-8 right-8 text-secondary-100 hover:text-primary-100 transition-colors"
        aria-label="Close newsletter"
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>

      <div className="flex flex-col items-start max-w-3xl mx-auto">
        <h1
          id="newsletter-title"
          className="text-[16px] leading-none overflow-hidden xl:mb-12 text-left"
        >
          <span className="block text-base text-secondary-100 font-body">
            NEWSLETTER
          </span>
          <span className="block text-primary-100 text-4xl">omentejovem</span>
        </h1>

        <div className="mb-24 flex flex-col gap-8">
          <p className="text-base text-secondary-100 font-body  max-w-[480px]">
            Receive exclusive insights on new art drops, collaborations,
            exhibitions, and upcoming talks from OMENTEJOVEM. Enter your email
            to connect with the vision and evolution behind the art.
          </p>

          <div className="relative w-full sm:w-[50vw] max-w-2xl">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your email here"
              className={cn(
                'w-full text-2xl sm:text-4xl bg-transparent border-l-0 border-r-0 border-t-0 border-b border-b-secondary-100 text-secondary-100 placeholder-secondary-100/50 outline-none focus:outline-none focus:ring-0 focus:border-b-neutral-500 pr-14',
                {
                  'border-b-green-500': isValidEmail,
                  'border-b-red-500': !isValidEmail && email.length > 0
                }
              )}
            />
            {isValidEmail && !isSubmitted && (
              <button
                onClick={handleSubmit}
                className="absolute right-0 top-4 -translate-y-1/2 bottom-auto bg-primary-100 rounded-lg w-12 h-8 hidden sm:flex items-center justify-center hover:opacity-80 transition-opacity"
              >
                <span className="text-white text-lg">→</span>
              </button>
            )}
            {isSubmitted && (
              <div className="absolute -bottom-8 left-0 text-green-500">
                Thank you for subscribing!
              </div>
            )}

            <div className="fixed sm:static bottom-16 left-0 w-full sm:w-auto flex justify-center gap-4 sm:flex-row">
              <button
                onClick={handleDismiss}
                className="sm:mt-12 px-4 py-2 border border-gray-400 rounded-lg text-secondary-100 hover:bg-gray-100/10 transition-colors"
              >
                {isSubmitted
                  ? 'Close'
                  : email?.length > 0
                    ? 'Not now'
                    : 'Close window'}
              </button>
              {isValidEmail && !isSubmitted && (
                <button
                  onClick={handleSubmit}
                  className="sm:hidden bg-primary-100 rounded-lg w-1/2 py-2 flex items-center justify-center hover:opacity-80 transition-opacity"
                >
                  <span className="text-white text-lg">
                    Subscribe <span className="ml-12">→</span>
                  </span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
