<template>
    <div>
        <div v-if="statusCode === 200">
            <div class="text-4xl text-green-500 font-bold">{{ getConfig('saying') }}</div>
            <div v-for="a in article" :key="a.index">
                <div class="flex-col justify-between h-auto w-full mx-auto my-4 p-4 border-3 border-green-500 border-dashed rounded-lg">
                    <div class="text-2xl dark:text-green-100">
                        {{ a.title }}
                    </div>
                    <div class="text-md text-gray-500 dark:text-green-100">
                        {{ a.updateDate }}
                    </div>
                    <div class="flex w-full justify-end">
                            <NuxtLink :to="'/article/' + a.id">
                                <div class="bg-green-100 dark:bg-green-900 dark:text-green-100 p-1 border-3 border-green-500 border-dashed rounded-lg text-green-800 font-bold">
                                    {{ getConfig('button') }}
                                </div>
                            </NuxtLink>
                    </div>
                </div>
            </div>
            <div v-if="article.length === 0">
                空
            </div>
        </div>
        <div v-else>
            <div class="text-4xl">{{ statusCode }}</div>
        </div>
    </div>
</template>

<script setup>
const isLoading = useLoadStatus()
const headMessage = useHeadMessage()
const blogSettings = useBlogSettings()
const storeBlogSettings = useStoreBlogSettings()
const errorMessage = useErrorMessage()
</script>

<script>
import axios from 'axios'
export default {
    name: 'index',
    layout: 'home',
    data () {
        return {
            article: [],
            defaultSettings: {
                saying: '全部文章：',
                desc: true,
                button: '点击阅读'
            },
            statusCode: 200
        }
    },
    beforeMount() {
        this.isLoading = true
        this.headMessage = ''
        this.errorMessage = ''

        const getData = (a) => {
            this.article = a
            this.sortArticle()
        }
        const getSettings = (s) => {
            this.blogSettings = s
            this.storeBlogSettings = true
        }
        const isBlogSettings = () => false
        const statusMonitor = [false, false]
        const stopLoading = (i) => {
            statusMonitor[i] = true
            if (statusMonitor[0] && statusMonitor[1]) {
                this.isLoading = false
            }
        }
        const getStatusCode = (c) => {
            this.statusCode = c
            if (c !== 200) {
                this.errorMessage = c
            }
        }

        axios.get('/api/index')
        .then(async (response) => {
            if (!isBlogSettings()) {
                await axios.get(response.data.settingsUrl)
                .then((response) => {
                    getSettings(response.data)
                })
                .catch((error) => {
                    getStatusCode(error.response.status)
                })
                .finally(() => {
                    stopLoading(1)
                })
            } else {
                stopLoading(1)
            }
            getData(response.data.article)
        })
        .catch((error) => {
            getStatusCode(error.response.status)
        })
        .finally(() => {
            stopLoading(0)
        })
    },
    methods: {
        sortArticle () {
            let i = 0
            for (const a of this.article) {
                const indexValue = Number(a.dirName.substring(0, a.dirName.indexOf('-')))
                if (typeof indexValue === 'number' && !isNaN(indexValue)) {
                    this.article[i].index = indexValue
                    this.article[i].title = a.dirName.substring(a.dirName.indexOf('-') + 1)
                    this.article[i].updateDate = this.article[i].updateDate.substring(0, this.article[i].updateDate.indexOf('T'))
                    i = i + 1
                }
            }
            if (this.getConfig('desc')) {
                this.article.sort((a, b) => b.index - a.index)
            }
            else {
                this.article.sort((a, b) => a.index - b.index)
            }
        },
        getConfig (name) {
            if (this.blogSettings !== undefined) {
                if (this.blogSettings[name] !== undefined) {
                    return this.blogSettings[name]
                }
            }
            return this.defaultSettings[name]
        }
    }
}
</script>
