<template>
    <div class="border-3 border-green-500 border-dashed rounded-lg p-2">
        <div v-if="password">
            <div class="text-3xl text-green-800 dark:text-green-100">请输入密码：</div>
            <div class="flex-col my-4">
                <div class="flex justify-center">
                    <div class="border-3 border-dashed rounded-md w-md" :class="borderColor">
                        <div class="filter" :class="blurLevel">
                            <input
                                v-model="myPassword"
                                class="w-full text-center dark:bg-dark dark:text-green-100"
                                style="outline: none;"
                                @keyup.enter="loadArticle"
                                @focus="onFocus"
                                @blur="onBlur"
                            />
                        </div>
                    </div>
                    <button class="w-8 h-8 ml-4 text-2xl text-red-600" @click="loadArticle">☑</button>
                </div>
            </div>
        </div>
        <div v-else>
            <div v-if="contentType === 'html'">
                <iframe class="w-full" style="height: calc(100vh - 8.5rem)" :srcdoc="content" />
            </div>
            <div v-else-if="contentType === 'md' || contentType === 'markdown'">
                <div class="dark:text-green-100 dark:bg-dark markdown-body w-full" v-html="content" />
            </div>
            <div v-else-if="contentType === 'txt'">
                <div class="dark:text-green-100" style="white-space: pre-wrap;" v-text="content" />
            </div>
        </div>
    </div>
</template>

<script setup>
const isLoading = useLoadStatus()
const headMessage = useHeadMessage()
const errorMessage = useErrorMessage()
</script>

<script>
import axios from 'axios'
import { marked } from 'marked'
export default {
    name: '[id]',
    layout: 'home',
    data () {
        return {
            content: '',
            contentType: 'txt',
            settings: {},
            files: [],
            password: false,
            statusCode: 200,
            myPassword: '',
            borderColor: 'border-green-500',
            blurLevel: 'blur-2'
        }
    },
    beforeMount() {
        this.loadArticle('')
    },
    methods: {
        loadArticle () {
            this.isLoading = true
            this.headMessage = ''
            this.errorMessage = ''
            const articleId = this.$route.params.id
            const password = this.myPassword
            const getContent = (c) => this.content = c
            const getContentType = (t) => {
                this.contentType = t
                if (t === 'md' || t === 'markdown' || t === 'html') {
                    if (t === 'md' || t === 'markdown') {
                        this.content = marked.parse(this.content)
                    }
                    for (const f of this.files) {
                        this.content = this.content.replaceAll('src="' + f.name, 'src="' + f.url)
                        this.content = this.content.replaceAll('src="./' + f.name, 'src="./' + f.url)
                        this.content = this.content.replaceAll('href="' + f.name, 'href="' + f.url)
                        this.content = this.content.replaceAll('href="./' + f.name, 'href="./' + f.url)
                    }
                }
            }
            const getSettings = (s) => this.settings = s
            const getFiles = (f) => this.files = f
            const needPassword = () => {
                this.password = true
                if (this.myPassword !== '') {
                    this.borderColor = 'border-red-500'
                }
            }
            const noNeedPassword = () => this.password = false
            const getStatusCode = (c) => {
                this.statusCode = c
                if (c !== 200) {
                    this.errorMessage = c
                }
            }
            const statusMonitor = [false, false]
            const stopLoading = (i) => {
                statusMonitor[i] = true
                if (statusMonitor[0] && statusMonitor[1]) {
                    this.isLoading = false
                }
            }
            axios.get('/api/article', {
                params: {
                    id: articleId,
                    password: password
                }
            }).then((response) => {
                if (!response.data.password) {
                    noNeedPassword()
                    getSettings(response.data.settings)
                    getFiles(response.data.files)
                    if (response.data.contentUrl === '') {
                        getContent('文件缺失，请等待同步')
                        stopLoading(1)
                        return
                    }
                    axios.get(response.data.contentUrl)
                    .then((contentResponse) => {
                        getContent(contentResponse.data)
                        getContentType(response.data.contentType)
                    })
                    .catch((contentError) => {
                        getStatusCode(contentError.response.status)
                    })
                    .finally(() => {
                        stopLoading(1)
                    })
                } else {
                    stopLoading(1)
                    needPassword()
                }
            }).catch((error) => {
                getStatusCode(error.response.status)
            }).finally(() => {
                stopLoading(0)
            })
        },
        onFocus () {
            this.blurLevel = 'blur-1'
        },
        onBlur () {
            this.blurLevel = 'blur-4'
        }
    }
}
</script>

<style scoped>
button {
    outline: none;
}
.markdown-body {}
</style>
