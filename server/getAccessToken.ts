import config from "#config";
import axios from "axios";

export default async (reload: boolean) => {
    const accessToken = { token: '', error: false }
    if (config.ACCESS_TOKEN !== undefined) {
        accessToken.token = config.ACCESS_TOKEN
    }
    if (reload === false && accessToken.token !== '') {
        return accessToken
    }

    const body = new URLSearchParams()
    body.append('client_id', config.CLIENT_ID)
    body.append('redirect_uri', config.REDIRECT_URI)
    body.append('client_secret', config.CLIENT_SECRET)
    body.append('refresh_token', config.REFRESH_TOKEN)
    body.append('grant_type', 'refresh_token')

    await axios.post(
        'https://login.microsoftonline.com/common/oauth2/v2.0/token',
        body,
        { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    ).then((response) => {
        accessToken.token = response.data.access_token
    }).catch(() => {
        accessToken.error = true
    })

    return accessToken
}
