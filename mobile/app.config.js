// Configuração dinâmica do app (complementa o app.json).
// - EXPO_BASE_URL: caminho base da versão web (ex.: /input-ai para https://<usuario>.github.io/input-ai/).
// - EAS_PROJECT_ID: ID do projeto na Expo (expo.dev), usado pelo EAS para gerar o app instalável.
module.exports = ({ config }) => ({
  ...config,
  experiments: {
    ...config.experiments,
    ...(process.env.EXPO_BASE_URL ? { baseUrl: process.env.EXPO_BASE_URL } : {}),
  },
  extra: {
    ...config.extra,
    ...(process.env.EAS_PROJECT_ID ? { eas: { projectId: process.env.EAS_PROJECT_ID } } : {}),
  },
  ...(process.env.EAS_PROJECT_ID ? { updates: { url: `https://u.expo.dev/${process.env.EAS_PROJECT_ID}` } } : {}),
});
