import axios from 'axios';

const OAUTH_URL = process.env.REACT_APP_OAUTH_URL;
const APP_KEY = process.env.REACT_APP_OAUTH_APP_KEY;
const OAUTH_REFRESH_URL = process.env.REACT_APP_OAUTH_REFRESH_URL;

export default class OAuthService {
  refreshToken = "";
  accessToken = "";
  timeoutId = null;

  async getOAuthToken(identifier, password) {
    const client = axios.create({ headers: { "X-IG-API-KEY": APP_KEY, Version: "3" } });
    const response = await client.post(OAUTH_URL, { identifier, password });
    const { access_token, refresh_token } = response.data.oauthToken;
    this.accessToken = access_token;
    this.getRefreshToken(refresh_token);
    return access_token;
  }

  getRefreshToken(newToken) {
    if (!this.timeoutId) {
      this.timeoutId = setTimeout(async () => {
        const refreshClient = axios.create({ headers: { "X-IG-API-KEY": APP_KEY } });
        const response = await refreshClient.post(OAUTH_REFRESH_URL, { refresh_token: newToken });
        const { data: { access_token, refresh_token } } = response;
        this.accessToken = access_token;
        clearTimeout(this.timeoutId);
        this.timeoutId = null;
        this.getRefreshToken(refresh_token);
      }, 60000 - 3000);
    }
  }

  stopTokenRefresh() {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }

}
