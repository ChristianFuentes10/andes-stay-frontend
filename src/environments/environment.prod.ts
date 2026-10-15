export const environment = {
  production: true,
  bffBaseUrl: 'CHANGE_ME', // URL del BFF ya desplegado
  cognito: {
    domain: 'CHANGE_ME.auth.us-east-1.amazoncognito.com',
    clientId: 'CHANGE_ME',
    redirectUri: 'CHANGE_ME/callback',
    logoutUri: 'CHANGE_ME/login',
  },
};
