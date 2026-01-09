import tailwindcss from '@tailwindcss/postcss'
import autoprefixer from 'autoprefixer'
import postcssPresetEnv from 'postcss-preset-env'

export default {
  plugins: [postcssPresetEnv, tailwindcss, autoprefixer],
}
