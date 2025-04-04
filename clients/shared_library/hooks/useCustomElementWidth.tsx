import { useEffect, useState } from 'react'

export const useCustomElementWidth = (elementId: string, offset: number = 100) => {
  const [elementWidth, setElementWidth] = useState(0)

  useEffect(() => {
    let element: HTMLElement | null = null
    let observer: ResizeObserver | null = null
    let rafId: number

    const updateWidth = () => {
      if (element) {
        setElementWidth(element.clientWidth - offset)
      }
    }

    const tryFindElement = () => {
      element = document.getElementById(elementId)
      if (element) {
        updateWidth()

        observer = new ResizeObserver(updateWidth)
        observer.observe(element)

        window.addEventListener('resize', updateWidth)
      } else {
        rafId = requestAnimationFrame(tryFindElement)
      }
    }

    tryFindElement()

    return () => {
      if (observer && element) observer.unobserve(element)
      if (rafId) cancelAnimationFrame(rafId)
      window.removeEventListener('resize', updateWidth)
    }
  }, [elementId, offset])

  return elementWidth
}
