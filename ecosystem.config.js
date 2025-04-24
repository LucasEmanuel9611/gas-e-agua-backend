module.exports = {
  apps: [
    {
      name: "gas-e-agua-api",
      script: "yarn",
      args: "dev",
      exec_mode: "fork",
      watch: true, // reinicia ao detectar alterações nos arquivos
      max_restarts: 10, // máximo de tentativas de restart
      restart_delay: 1000, // espera 1 segundo entre os restarts
      autorestart: true, // garante que ele sempre tente reiniciar
      env: {
        NODE_ENV: "development",
      },
    },
  ],
};
