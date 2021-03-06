const jwt = require('jsonwebtoken');
const fs = require('fs');
const axios = require('axios');

const tokenUrl = 'https://www.googleapis.com/oauth2/v4/token';
const axiosConfig = { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } };
const grantType = 'urn:ietf:params:oauth:grant-type:jwt-bearer';

module.exports.templateTags = [{
  name: 'jwtCreate',
  displayName: 'Google JWT Creator',
  description: 'Generate Google JWT with RS256 signature',
  args: [{
    displayName: 'IAP Client ID',
    description: 'This is retrieved from the three dot menu of your IAP in Google Cloud',
    type: 'string',
    defaultValue: ''
  },
  {
    displayName: 'Credentials Location',
    description: 'Unqualified location of your service account credentials',
    type: 'string',
    defaultValue: '',
  }],
  async run(_context, target_audience, location) {
    const serviceCredentials = JSON.parse(fs.readFileSync(location));
    const payload = {
      iat: Math.floor(new Date().getTime() / 1000) - 10,
      exp: Math.floor(new Date().getTime() / 1000) + 120,
      target_audience
    }
    const options = {
      algorithm: "RS256",
      keyid: serviceCredentials.private_key_id,
      audience: tokenUrl,
      issuer: serviceCredentials.client_email,
      subject: serviceCredentials.client_email,
    }
    const token = jwt.sign(payload, serviceCredentials.private_key, options);

    return await axios.post(tokenUrl, `assertion=${token}&grant_type=${grantType}`, axiosConfig)
      .then(res => res.data.id_token);
  }
}];
