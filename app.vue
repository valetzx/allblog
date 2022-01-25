<template>
  <div>
    <NuxtPage />
  </div>
</template>

<script>
export default {
    setup () {
        const config = useRuntimeConfig()
        useMeta({
            meta: [
                { name: 'viewport', content: 'width=device-width, initial-scale=1, maximum-scale=1' }
            ],
            title: config.WEBSITE_NAME,
            bodyAttrs: {
                class: 'dark:bg-dark'
            }
        })
    }
}
</script>

<style>
::selection{
    background-color: rgba(16, 185, 129);
    color: #FFFFFF;
}
::-moz-selection{
    background-color: rgb(16, 185, 129);
    color: #FFFFFF;
}
</style>
