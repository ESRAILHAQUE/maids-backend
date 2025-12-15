module.exports = {
  apps: [
    {
      name: "aethla-backend",
      script: "./dist/server.js",
      instances: 1,
      exec_mode: "fork",
      env: {
        NODE_ENV: "production",
        PORT: 5000,
      },
      error_file: "./logs/err.log",
      out_file: "./logs/out.log",
      log_file: "./logs/combined.log",
      time: true,
      autorestart: true,
      watch: false,
      max_memory_restart: "500M",
    },
  ],
};
