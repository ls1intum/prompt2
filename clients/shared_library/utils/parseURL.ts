export const parseURL = (envURL: string): string => {
  if (envURL === '') {
    return window.location.origin // defaults to location
  } else if (envURL.startsWith('http')) {
    return envURL // absolute URL
  } else {
    return `https://${envURL}` // relative URL
  }
}
