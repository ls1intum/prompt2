export interface DataPoint {
  dataKey: string
  accepted?: number
  rejected?: number
  notAssessed?: number
  total: number
  // other keys if needed
}
