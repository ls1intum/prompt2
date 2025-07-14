interface AvatarStackProps {
  avatars: React.ReactNode[] // List of React components
  size?: number // Pixel diameter of the icons
  overlap?: number // Amount of overlap (0 = no overlap, 1 = completely overlapping)
  rotationStep?: number // Degree difference between neighbors
}

export const AvatarStack = ({
  avatars,
  size = 40,
  overlap = 0.6,
  rotationStep = 3,
}: AvatarStackProps) => {
  // For overlap: 0 = no overlap, 1 = completely overlapping
  // shift should decrease as more overlap is desired
  const shift = size * (1 - overlap)
  const spreadGap = size * 0.3 // Gap between items when spread out

  return (
    <div
      className='relative overflow-visible group cursor-pointer'
      style={{
        width: Math.max(size, size + shift * (avatars.length - 1)),
        height: size,
      }}
    >
      {avatars.map((avatar, idx) => {
        // Calculate position and rotation
        const left = idx * shift
        // z-index in reverse order, so later images are on top
        const zIndex = avatars.length - idx
        const center = (avatars.length - 1) / 2
        const rotation = (idx - center) * rotationStep

        return (
          <div
            key={idx}
            className='absolute flex items-center justify-center transition-all duration-300 ease-in-out'
            style={{
              width: size,
              height: size,
              left,
              top: 0,
              zIndex,
              transform: `rotate(${rotation}deg)`,
            }}
          >
            <div
              className='transition-all duration-300 ease-in-out group-hover:!rotate-0'
              style={{
                transform: `translateX(0px)`,
              }}
              onMouseEnter={(e) => {
                const wrapper = e.currentTarget.closest('.group')
                if (wrapper) {
                  const allItems = wrapper.querySelectorAll('.absolute > div')
                  allItems.forEach((item, itemIdx) => {
                    const itemSpreadLeft =
                      itemIdx * (size + spreadGap) - ((avatars.length - 1) * (size + spreadGap)) / 2
                    ;(item as HTMLElement).style.transform =
                      `translateX(${itemSpreadLeft}px) rotate(0deg)`
                  })
                }
              }}
              onMouseLeave={(e) => {
                const wrapper = e.currentTarget.closest('.group')
                if (wrapper) {
                  const allItems = wrapper.querySelectorAll('.absolute > div')
                  allItems.forEach((item, itemIdx) => {
                    const itemCenter = (avatars.length - 1) / 2
                    const itemRotation = (itemIdx - itemCenter) * rotationStep
                    ;(item as HTMLElement).style.transform =
                      `translateX(0px) rotate(${itemRotation}deg)`
                  })
                }
              }}
            >
              {avatar}
            </div>
          </div>
        )
      })}
    </div>
  )
}
