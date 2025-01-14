// Getting the list of countries
import countries from 'i18n-iso-countries'
import enLocale from 'i18n-iso-countries/langs/en.json'

countries.registerLocale(enLocale)
export const countriesArr = Object.entries(countries.getNames('en', { select: 'alias' })).map(
  ([key, value]) => {
    return {
      label: value,
      value: key,
    }
  },
)

// Getting the name of the country by its code
export const getCountryName = (code: string): string | undefined => {
  return countriesArr.find((country) => country.value === code)?.label
}
