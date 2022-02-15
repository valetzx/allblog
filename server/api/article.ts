import axios from 'axios'
import config from '#config'
import getAccessToken from '~/server/getAccessToken'
import { IncomingMessage, ServerResponse } from 'http'
import { URLSearchParams } from 'url'

export default async (req: IncomingMessage, res: ServerResponse) => {
    const result = {
        contentUrl: '',
        contentType: '',
        settings: {},
        files: [],
        password: false
    }

    const articleId = (new URLSearchParams(req.url)).get('id')
    const articlePassword = (new URLSearchParams(req.url)).get('password')

    const accessToken = await getAccessToken(false)
    if (accessToken.error) {
        return result
    }

    let itemsCache = []

    const path = config.ONEDRIVE_URI + '/items/' + articleId + '/children'
    await axios.get(
        path + '?select=name,@microsoft.graph.downloadUrl,file',
        { headers: { Authorization: 'bearer ' + accessToken.token } }
    ).then((response) => {
        itemsCache = response.data.value
        res.statusCode = 200
    }).catch((error) => {
        res.statusCode = error.response.status
    })

    if (res.statusCode !== 200) {
        return result
    }

    const settingItem = itemsCache.findIndex(item => (item.name === 'settings.json' || item.name === 'Settings.json'))
    let settings = { password: '' }
    if (settingItem !== -1) {
        await axios.get(itemsCache[settingItem]['@microsoft.graph.downloadUrl'])
            .then((response) => {
                itemsCache.splice(settingItem, 1)
                settings = response.data
            })
            .catch((error) => {
                res.statusCode = error.response.status
            })
        if (res.statusCode !== 200) {
            return result
        }
    }

    if (settings['password'] === undefined || settings['password'] === articlePassword) {
        result.settings = settings
        result.settings['password'] = ''
    }
    else {
        result.password = true
        return result
    }

    const fileIndex = [
        'index.url',
        'redirect.url',
        'index.html',
        'index.md',
        'index.markdown',
        'index.txt'
    ]

    for (const fi of fileIndex) {
        const indexOfFile = itemsCache.findIndex(item => item.name === fi)
        if (indexOfFile !== -1) {
            result.contentUrl = itemsCache[indexOfFile]['@microsoft.graph.downloadUrl']
            if (fi === 'redirect.url') {
                result.contentType = 'redirect'
            }
            else {
                result.contentType = fi.split('.')[1]
            }
            itemsCache.splice(indexOfFile, 1)
            break
        }
    }

    if (result.contentType === 'html' || result.contentType === 'md' || result.contentType === 'markdown') {
        for (const ic of itemsCache) {
            if (ic['file'] !== undefined) {
                result.files.push({
                    name: ic.name,
                    url: ic['@microsoft.graph.downloadUrl']
                })
            }
        }
    }

    return result
}
