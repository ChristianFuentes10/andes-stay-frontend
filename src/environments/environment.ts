export const environment = {
  production: false,
  bffBaseUrl: 'http://localhost:8080',
  cognito: {
    // TODO: reemplaza estos 4 valores con los datos reales de tu User Pool / App Client.
    // Los encuentras en AWS Console -> Cognito -> User Pools -> tu pool -> App integration.
    domain: 'CHANGE_ME.auth.us-east-1.amazoncognito.com', // dominio del Hosted UI, SIN "https://"
    clientId: 'CHANGE_ME',
    redirectUri: 'http://localhost:4200/callback',
    logoutUri: 'http://localhost:4200/login',
  },
};
