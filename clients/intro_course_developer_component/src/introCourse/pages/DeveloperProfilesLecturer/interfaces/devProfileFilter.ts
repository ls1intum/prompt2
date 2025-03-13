export type DevProfileFilter = {
  surveyStatus: {
    completed: boolean
    notCompleted: boolean
  }
  devices: {
    noDevices: boolean
    macBook: boolean
    iPhone: boolean
    iPad: boolean
    appleWatch: boolean
  }
}
