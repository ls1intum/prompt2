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
  const hoverShift = size * 0.1 // Small gap between items when hovered

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
        const hoverLeft = idx * hoverShift
        // z-index in reverse order, so later images are on top
        const zIndex = avatars.length - idx
        const center = (avatars.length - 1) / 2
        const rotation = (idx - center) * rotationStep

        return (
          <div
            key={idx}
            className='absolute flex items-center justify-center transition-all duration-300 ease-in-out'
            style={
              {
                width: size,
                height: size,
                left,
                top: 0,
                zIndex,
                transform: `rotate(${rotation}deg)`,
                '--hover-left': `${hoverLeft}px`,
              } as React.CSSProperties & { '--hover-left': string }
            }
          >
            <div className='group-hover:transform group-hover:rotate-0 group-hover:translate-x-[var(--hover-left)] transition-all duration-300 ease-in-out'>
              {avatar}
            </div>
          </div>
        )
      })}
    </div>
  )
}
