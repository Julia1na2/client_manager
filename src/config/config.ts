import 'dotenv/config'

export const config = {
  databaseUrl: process.env.DATABASE_URL,
  nodeEnvironment: process.env.NODE_ENV,
  appBaseUrl: process.env.APP_BASE_URL,
  appDefaultLanguage: process.env.APP_LANGUAGE,
  bcryptHashRound: 10,

  nellysCoinBaseUrlV1: process.env.NELLYS_COIN_BASE_URL_V1,
  nellysCoinClientId: process.env.NELLYS_COIN_CLIENT_ID,
  nellysCoinClientSecret: process.env.NELLYS_COIN_CLIENT_SECRET,
  apiClientIdLength: 15,
  apiClientSecretLength: 25,

  joiOptions: {
    errors: {
      wrap: {
        label: '',
      },
    },
    abortEarly: true,
  },

  // * Slack Alerts
  backendErrorSlackWebhook: process.env.BACKEND_ERROR_SLACK_WEBHOOK!,
};
