import { ThemeOptions } from '@mui/material/styles'

import { Oswald, Poppins } from 'next/font/google'

const oswald = Oswald({ subsets: ['latin'], display: 'swap' })
const poppins = Poppins({ weight: ['400', '700'], subsets: ['latin'], display: 'swap' })

const theme: ThemeOptions = {
  typography: {
    fontFamily: poppins.style.fontFamily,
    h1: {
      fontFamily: oswald.style.fontFamily,
    },
    h2: {
      fontFamily: oswald.style.fontFamily,
    },
    h3: {
      fontFamily: oswald.style.fontFamily,
    },
    h4: {
      fontFamily: oswald.style.fontFamily,
    },
    h5: {
      fontFamily: oswald.style.fontFamily,
    },
    h6: {
      fontFamily: oswald.style.fontFamily,
    },
  },
}

export default theme
