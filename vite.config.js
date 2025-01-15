// vite.config.js
import react from '@vitejs/plugin-react'

import{ defineConfig } from 'vite'
import tailwindcss from 'tailwindcss'
import autoprefixer from 'autoprefixer'

// https://vitejs.dev/config/
export default {
  plugins: [react()],
  css:{
    postcss:{
      plugins:[
        tailwindcss(),
        autoprefixer()
      ]
    }
  }
}
