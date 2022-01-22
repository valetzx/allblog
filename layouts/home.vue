<template>
    <div>
        <header class="fixed z-10 top-0 left-0 h-18 w-full backdrop-filter backdrop-blur bg-white dark:bg-dark bg-opacity-80 dark:backdrop-filter dark:backdrop-blur dark:bg-opacity-80">
            <div class="flex h-18 items-center">
                <button class="ml-3 mr-1 text-2xl text-green-500 dark:text-green-100" @click="goBack">↩</button>
                <button class="mr-3 ml-1 text-2xl" @click="changeMode">{{ modeIcon }}</button>
                <div class="mx-2 cursor-pointer text-xl font-mono font-medium dark:text-green-100" @click="goHome">Back to /Blog </div>
                <div class="mx-2 text-xl font-mono text-green-500 dark:text-green-100">{{ headMessage }}</div>
                <div class="flex justify-end w-full">
                    <div class="mx-2 text-xl font-mono font-medium text-green-500 dark:text-green-100">{{ config.WEBSITE_NAME }}</div>
                </div>
            </div>
        </header>
        <div class="h-18 w-full"></div>
        <div v-if="isLoading || errorMessage !== ''">
            <div class="fixed h-full w-full z-20 flex justify-center items-center backdrop-filter backdrop-blur">
                <div class="mb-48 flex-col place-content-center">
                    <div class="flex justify-center">
                        <img src="~/assets/onedrive.png" alt="logo" class="filter -hue-rotate-45" :class="animateClass">
                    </div>
                    <div class="flex justify-center">
                        <div class="text-2xl text-green-900 dark:text-green-100 mx-1">
                            {{ errorInfo }}
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="container mx-auto my-4 z-0">
            <slot />
        </div>
    </div>
</template>

<script setup>
const config = useRuntimeConfig()
const isLoading = useLoadStatus()
const headMessage = useHeadMessage()
const errorMessage = useErrorMessage()
</script>

<script>
export default {
    name: 'home',
    data () {
        return {
            backBtnClass: '',
            nowMode: 1
        }
    },
    computed: {
        modeIcon () {
            return this.nowMode === 0 ? '🌙' : '☀'
        },
        animateClass () {
            if (this.errorMessage !== '') {
                return 'grayscale-80'
            }
            return 'animate-pulse'
        },
        errorInfo () {
            if (this.errorMessage === '') {
                return ''
            }
            switch (this.errorMessage) {
                case 400: {
                    return '400: 访问格式错误，请不要乱输入链接'
                }
                case 401: {
                    return '401: 授权错误，请检查各项Token'
                }
                case 403: {
                    return '403: 拒绝访问，请检查各项Token'
                }
                case 404: {
                    return '404: 找不到项目，删得挺快'
                }
                default: {
                    return this.errorMessage.toString() + ': 接口出错，请报告给开发者'
                }
            }
        }
    },
    methods: {
        goBack () {
            this.$router.back()
        },
        goHome () {
            this.$router.push({ path: '/' })
        },
        changeMode () {
            this.nowMode = 1 - this.nowMode
            if (this.nowMode === 0) {
                document.documentElement.classList.add('dark')
            }
            else if (this.nowMode === 1) {
                document.documentElement.classList.remove('dark')
            }

        }
    }
}
</script>

<style src="assets/css/github-markdown.css"></style>
<style scoped>
button {
    outline: none;
}
</style>
