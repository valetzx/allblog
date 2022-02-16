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

    const settingItem = itemsCache.find(item => (item.name === 'settings.json' || item.name === 'Settings.json'))
    let settings = { password: '' }
    if (settingItem !== undefined) {
        await axios.get(settingItem['@microsoft.graph.downloadUrl'])
            .then((response) => {
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
        'index.html',
        'index.md',
        'index.markdown',
        'index.txt'
    ]

    for (const fi of fileIndex) {
        const temp = itemsCache.find(item => item.name === fi)
        if (temp !== undefined) {
            result.contentUrl = temp['@microsoft.graph.downloadUrl']
            result.contentType = fi.split('.')[1]
            break
        }
    }

    for (const ic of itemsCache) {
        if (ic.name !== 'index.html' && ic.name !== 'index.md' && ic.name !== 'index.txt') {
            if (ic.name !== 'settings.json' && ic.name !== 'Settings.json') {
                if (ic['file'] !== undefined) {
                    result.files.push({
                        name: ic.name,
                        url: ic['@microsoft.graph.downloadUrl']
                    })
                }
            }
        }
    }

    return result
}
