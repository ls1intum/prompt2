export const renderTooltipList = (
  title: string,
  items: { key: string; type: string }[] | string[],
) => {
  if (Array.isArray(items) && items.length === 0) {
    return <p>No specific {title.toLowerCase()} expected</p>
  }

  return (
    <div>
      <span className='font-bold'>{title}:</span>
      <ul className='list-disc pl-5'>
        {Array.isArray(items)
          ? items.map((item, index) =>
              typeof item === 'string' ? (
                <li key={index}>{item}</li>
              ) : (
                <li key={index}>
                  <span className='font-bold'>{item.key}:</span> {item.type}
                </li>
              ),
            )
          : null}
      </ul>
    </div>
  )
}
