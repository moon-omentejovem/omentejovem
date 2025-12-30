import { Dispatch, SetStateAction } from 'react'

// Função para inicializar GSAP apenas no cliente com imports dinâmicos
let gsapInitialized = false
let gsap: any
let CustomEase: any
let ScrollTrigger: any
let ScrollToPlugin: any
let SplitType: any

/**
 * Initializes GSAP and related plugins on the client side using dynamic imports.
 * Registers CustomEase, ScrollTrigger, and ScrollToPlugin with GSAP, and sets up custom eases.
 * Ensures initialization occurs only once per client session.
 *
 * @returns {Promise<void>} Resolves when GSAP and plugins are initialized.
 */
async function initializeGSAP() {
  if (typeof window === 'undefined' || gsapInitialized) return
  
  try {
    const [gsapModule, gsapPlugins, splitTypeModule] = await Promise.all([
      import('gsap'),
      import('gsap/all'),
      import('split-type')
    ])
    
    gsap = gsapModule.default
    CustomEase = gsapPlugins.CustomEase
    ScrollTrigger = gsapPlugins.ScrollTrigger
    ScrollToPlugin = gsapPlugins.ScrollToPlugin
    SplitType = splitTypeModule.default

    gsap.registerPlugin(CustomEase)
    gsap.registerPlugin(ScrollTrigger)
    gsap.registerPlugin(ScrollToPlugin)

    CustomEase.create(
      'custom',
      'M0,0 C0,0.421 0.037,0.632 0.116,0.779 0.182,0.902 0.374,1 1,1'
    )
    CustomEase.create(
      'custom-out',
      'M0,0 C0.299,0 0.594,-0.011 0.772,0.047 1.016,0.127 1,0.949 1,1'
    )
    CustomEase.create('button', 'M0,0 C0.798,0 1,0.101 1,1')
    
    gsapInitialized = true
  } catch (error) {
    console.error('Failed to initialize GSAP:', error)
  }
}

export async function aboutAnimations() {
  await initializeGSAP()
  if (!gsap || !SplitType) return

  const splitSubtitle = new SplitType('h2#about-subtitle', { types: 'lines' })
  // const splitBio = new SplitType('div.bio')

  gsap.fromTo(
    '#about-title span',
    {
      y: 300,
      autoAlpha: 1
    },
    {
      y: 0,
      stagger: 0.1,
      duration: 2.5,
      ease: 'custom'
    }
  )
  gsap.fromTo(
    splitSubtitle.lines,
    {
      y: 100,
      opacity: 0
    },
    {
      visibility: 'visible',
      y: 0,
      opacity: 1,
      stagger: 0.1,
      duration: 2.5,
      delay: 0.1,
      ease: 'custom'
    }
  )
  gsap.fromTo(
    '#about-spans',
    {
      y: 400,
      opacity: 0
    },
    {
      visibility: 'visible',
      y: 0,
      opacity: 1,
      stagger: 0.1,
      duration: 2.5,
      delay: 0.1,
      ease: 'custom'
    }
  )
  gsap.fromTo(
    'p.bio',
    {
      y: 50,
      opacity: 0
    },
    {
      y: 0,
      opacity: 1,
      stagger: 0.1,
      duration: 2.5,
      ease: 'custom',
      scrollTrigger: {
        trigger: 'p.bio',
        start: 'top 90%'
      }
    }
  )
  gsap.fromTo(
    'div.bio',
    {
      y: 200,
      opacity: 0
    },
    {
      y: 0,
      opacity: 1,
      duration: 2.5,
      ease: 'custom',
      scrollTrigger: {
        trigger: 'p.bio',
        start: 'top 90%'
      }
    }
  )
  gsap.fromTo(
    '.socials',
    {
      y: 50,
      opacity: 0
    },
    {
      y: 0,
      opacity: 1,
      stagger: 0.1,
      delay: 0.2,
      duration: 2.5,
      ease: 'custom',
      scrollTrigger: {
        trigger: '.socials',
        start: 'top 90%'
      }
    }
  )
}

export async function calloutAnimation() {
  await initializeGSAP()
  if (!gsap) return

  gsap.fromTo(
    '.parallax-text p',
    {
      y: 120
    },
    {
      y: 0,
      delay: 0.3,
      stagger: 0.3,
      duration: 2.5,
      ease: 'custom',
      autoAlpha: 1
    }
  )
}

export async function collectionLinksAnimations(mobileSize: boolean) {
  await initializeGSAP()
  if (!gsap) return

  const tl = gsap.timeline()

  tl.fromTo(
    '.collection-link p',
    {
      y: 120
    },
    {
      y: 0,
      stagger: 0.1,
      duration: 1,
      ease: 'custom'
    }
  )
  tl.fromTo(
    '.collection-link p',
    { color: '#2B2B2B' },
    {
      color: mobileSize ? '#B1B1B1' : '#EBEBEB',
      delay: -0.5,
      stagger: 0.1,
      duration: 0.5,
      ease: 'expo.inOut'
    }
  )
  tl.set('.collection-link p', { clearProps: 'color' })
}

export async function footerAnimations() {
  await initializeGSAP()
  if (!gsap) return

  gsap.fromTo(
    '.footer-items',
    {
      y: 50,
      opacity: 0
    },
    {
      y: 0,
      opacity: 1,
      stagger: 0.1,
      delay: 0.2,
      duration: 2.5,
      ease: 'custom',
      scrollTrigger: {
        trigger: '#about-footer',
        start: 'top 90%'
      }
    }
  )
  gsap.fromTo(
    '.footer-email',
    {
      y: 50,
      opacity: 0
    },
    {
      y: 0,
      opacity: 1,
      stagger: 0.1,
      delay: 0.2,
      duration: 2.5,
      ease: 'custom',
      scrollTrigger: {
        trigger: '#about-footer',
        start: 'top 90%'
      }
    }
  )
}

export async function headerAnimations() {
  await initializeGSAP()
  if (!gsap) return

  gsap.fromTo(
    '.header-tab p',
    {
      y: 120
    },
    {
      y: 0,
      stagger: 0.1,
      duration: 0.4,
      ease: 'custom'
    }
  )
}

export async function filterAnimations(open: boolean) {
  await initializeGSAP()
  if (!gsap) return

  const tl = gsap.timeline()

  if (open) {
    tl.fromTo(
      '.filter-option p',
      { y: 0 },
      {
        y: 50,
        duration: 0.4,
        ease: 'custom'
      }
    )
  } else {
    tl.fromTo(
      '.filter-option p',
      { y: 50 },
      {
        y: 0,
        stagger: 0.1,
        duration: 0.4,
        ease: 'custom'
      }
    )
  }
}

export async function modalAnimations(
  setIsAnimating: Dispatch<SetStateAction<boolean>>
) {
  await initializeGSAP()
  if (!gsap) return

  setIsAnimating(true)

  gsap.fromTo(
    '.modal-overlay',
    { opacity: 0 },
    {
      opacity: 1,
      duration: 1,
      ease: 'custom'
    }
  )
  gsap.fromTo(
    '.modal-content',
    { y: 800 },
    {
      y: 0,
      duration: 1,
      ease: 'custom',
      onComplete: () => {
        setIsAnimating(false)
      }
    }
  )
}

export async function horizontalCarouselAnimation() {
  await initializeGSAP()
  if (!gsap) return

  gsap.set('body', {
    overflowX: 'hidden'
  })
  gsap.fromTo(
    '.animated-section',
    {
      xPercent: 100
    },
    {
      xPercent: 0,
      ease: 'custom',
      duration: 1.5,
      onComplete: () => {
        gsap.set('body', {
          overflowX: 'auto'
        })
      }
    }
  )
}

export async function carouselFigcaptionAnimation(
  element: HTMLElement,
  open: boolean
) {
  await initializeGSAP()
  if (!gsap) return

  if (open) {
    gsap.to(element.closest('.swiper-slide'), {
      zIndex: 999
    })
    gsap.to(element, {
      scale: 1.1,
      duration: 0.4,
      ease: 'custom'
    })
    gsap.fromTo(
      element.querySelectorAll('p'),
      {
        yPercent: 100
      },
      {
        yPercent: 0,
        duration: 0.4,
        ease: 'custom'
      }
    )
  } else {
    gsap.to(element, {
      scale: 1,
      duration: 0.4,
      ease: 'custom'
    })
    gsap.to(element.closest('.swiper-slide'), {
      zIndex: 'auto'
    })
    gsap.fromTo(
      element.querySelectorAll('p'),
      {
        yPercent: 0
      },
      {
        yPercent: 100,
        duration: 0.4,
        ease: 'custom'
      }
    )
  }
}

export async function carouselActiveSlideAnimation() {
  await initializeGSAP()
  if (!gsap) return

  gsap.to('.swiper-slide:not(.swiper-slide-active):not(.art-wrapper:hover) p', {
    yPercent: 100,
    duration: 0.4,
    ease: 'custom'
  })
  gsap.fromTo(
    '.swiper-slide-active p',
    {
      yPercent: 100
    },
    {
      yPercent: 0,
      duration: 0.4,
      ease: 'custom'
    }
  )
}

export async function artInfosAnimation(
  isOpen: boolean,
  setIsAnimating: Dispatch<SetStateAction<boolean>>
): Promise<void> {
  await initializeGSAP()
  if (!gsap) return

  const tl = gsap.timeline()

  setIsAnimating(true)

  if (isOpen) {
    tl.to('#art-description', {
      opacity: 0,
      duration: 0.4
    })
      .set('#art-description-text', {
        maxHeight: '6rem',
        overflowY: 'scroll'
      })
      .to('#art-description', {
        opacity: 1,
        duration: 0.4
      })
      .to(
        '#art-ownership-collections',
        {
          display: 'flex',
          opacity: 1,
          duration: 0.4,
          onComplete: () => {
            setIsAnimating(false)
          }
        },
        '<'
      )
  } else {
    tl.to(
      '#art-ownership-collections',
      {
        opacity: 0,
        duration: 0.4
      },
      '<'
    )
      .to(
        '#art-description',
        {
          opacity: 0,
          duration: 0.4
        },
        '<'
      )
      .set('#art-description-text', {
        maxHeight: 'fit-content'
      })
      .to('#art-description', {
        opacity: 1.0,
        duration: 0.4,
        onComplete: () => {
          setIsAnimating(false)
        }
      })
  }
}

export async function artInfosCollectionsAnimation(
  isOpen: boolean,
  setIsAnimating: Dispatch<SetStateAction<boolean>>
): Promise<void> {
  await initializeGSAP()
  if (!gsap) return

  const tl = gsap.timeline()

  setIsAnimating(true)

  if (isOpen) {
    tl.to('#art-description', {
      opacity: 0,
      duration: 0.4
    })
      .set('#art-description-text', {
        maxHeight: '6rem',
        overflowY: 'scroll'
      })
      .to('#art-description', {
        opacity: 1,
        duration: 0.4
      })
      .to(
        '#art-ownership-collections',
        {
          display: 'flex',
          opacity: 1,
          duration: 0.4,
          onComplete: () => {
            setIsAnimating(false)
          }
        },
        '<'
      )
  } else {
    tl.to(
      '#art-ownership-collections',
      {
        opacity: 0,
        duration: 0.4
      },
      '<'
    )
      .to(
        '#art-description',
        {
          opacity: 0,
          duration: 0.4
        },
        '<'
      )
      .set('#art-description-text', {
        maxHeight: 'fit-content'
      })
      .to('#art-description', {
        opacity: 1.0,
        duration: 0.4,
        onComplete: () => {
          setIsAnimating(false)
        }
      })
  }
}

export async function resetArtInfo(): Promise<void> {
  await initializeGSAP()
  if (!gsap) return

  const tl = gsap.timeline()

  tl.set('#art-ownership-collections', {
    opacity: 0
  }).set('#art-description-text', {
    maxHeight: 'fit-content'
  })
}

export async function artInfoButtonAnimation(): Promise<void> {
  await initializeGSAP()
  if (!gsap) return

  gsap.to('.art-info-button', {
    rotate: '+=45',
    duration: 0.2
  })
}

export async function resetButtonInfo(): Promise<void> {
  await initializeGSAP()
  if (!gsap) return

  gsap.set('.art-info-button', {
    rotate: 0
  })
}
