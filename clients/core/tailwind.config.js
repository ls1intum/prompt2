import sharedConfig from '../shared_library/tailwind.config.js'

/** @type {import('tailwindcss').Config} */
export const presets = [sharedConfig]
export const content = ['src/**/*.{ts,tsx}', '../shared_library/components/**/*.{ts,tsx}']
