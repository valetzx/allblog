import axios from 'axios'
import config from '#config'
import getAccessToken from '~/server/getAccessToken'
import { IncomingMessage, ServerResponse } from 'http'

export default async (_req: IncomingMessage, res: ServerResponse) => {
    const result = {
        article: [],
        settingsUrl: ''
    }

    const accessToken = await getAccessToken(false)
    if (accessToken.error) {
        return result
    }

    let articleCache = []

    const path = config.ONEDRIVE_URI + '/root' + (config.ROOT_PATH + '/').replace(/\//g, ':/')
    await axios.get(
        path + 'children?select=name,id,lastModifiedDateTime,@microsoft.graph.downloadUrl,folder',
        { headers: { Authorization: 'bearer ' + accessToken.token } }
    ).then((response) => {
        articleCache = response.data.value
        res.statusCode = 200
    }).catch((error) => {
        res.statusCode = error.response.status
    })

    if (res.statusCode !== 200) {
        return result
    }

    for (const articleCacheElement of articleCache) {
        if (articleCacheElement.name === 'settings.json' || articleCacheElement.name === 'Settings.json') {
            result.settingsUrl = articleCacheElement['@microsoft.graph.downloadUrl']
            continue
        }
        if (articleCacheElement.folder !== undefined) {
            result.article.push({
                dirName: articleCacheElement.name,
                id: articleCacheElement.id,
                updateDate: articleCacheElement.lastModifiedDateTime
            })
        }
    }
    return result
}
