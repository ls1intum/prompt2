import { useLayoutEffect, useState } from 'react'

export const useCustomElementWidth = (elementId: string, offset: number = 100) => {
  const [elementWidth, setElementWidth] = useState(0)

  useLayoutEffect(() => {
    const updateWidth = () => {
      const element = document.getElementById(elementId)
      if (element) {
        setElementWidth(element.clientWidth - offset)
      }
    }

    // Create a ResizeObserver instance to observe changes to the element's size
    const resizeObserver = new ResizeObserver(() => {
      updateWidth()
    })

    const element = document.getElementById(elementId)
    if (element) {
      resizeObserver.observe(element)
    }

    updateWidth()

    return () => {
      if (element) {
        resizeObserver.unobserve(element)
      }
    }
  }, [elementId, offset])

  return elementWidth
}
