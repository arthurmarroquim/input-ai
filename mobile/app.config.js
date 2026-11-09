// Configuração dinâmica: só muda o caminho base da versão web quando EXPO_BASE_URL é definido
// (ex.: EXPO_BASE_URL=/input-ai para publicar em https://<usuario>.github.io/input-ai/).
module.exports = ({ config }) => ({
  ...config,
  experiments: {
    ...config.experiments,
    ...(process.env.EXPO_BASE_URL ? { baseUrl: process.env.EXPO_BASE_URL } : {}),
  },
});
