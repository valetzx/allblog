import { defineNuxtConfig } from 'nuxt3'

// https://v3.nuxtjs.org/docs/directory-structure/nuxt.config
export default defineNuxtConfig({
    buildModules: [
        'nuxt-windicss',
    ],
    publicRuntimeConfig: {
        WEBSITE_NAME: 'Arect\'s blog'
    },
    privateRuntimeConfig: {
        CLIENT_ID: process.env.CLIENT_ID,
        CLIENT_SECRET: process.env.CLIENT_SECRET,
        REDIRECT_URI: 'http://localhost:3000',
        REFRESH_TOKEN: process.env.REFRESH_TOKEN,
        ROOT_PATH: '/Blog',
        ONEDRIVE_URI: 'https://graph.microsoft.com/v1.0/me/drive',
        OAUTH_URL: 'https://login.microsoftonline.com/common/oauth2/v2.0/token'
    }
})
