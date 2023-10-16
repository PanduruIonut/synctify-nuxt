// plugins/vuetify.js
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import * as labsComponents from 'vuetify/labs/components'
import { VSkeletonLoader } from 'vuetify/labs/VSkeletonLoader'



export default defineNuxtPlugin((nuxtApp) => {
    const vuetify = createVuetify({
        theme: {
            defaultTheme: 'dark'
          },
        ssr: true,
        components:{
            ...components,
            ...labsComponents,
            VSkeletonLoader
        },
        directives,
    })
    nuxtApp.vueApp.use(vuetify)
})