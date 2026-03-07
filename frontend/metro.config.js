// metro.config.js
const { getDefaultConfig } = require("expo/metro-config");
const path = require('path');
const { FileStore } = require('metro-cache');

const config = getDefaultConfig(__dirname);

// Use a stable on-disk store (shared across web/android)
const root = process.env.METRO_CACHE_ROOT || path.join(__dirname, '.metro-cache');
config.cacheStores = [
  new FileStore({ root: path.join(root, 'cache') }),
];


// // Exclude unnecessary directories from file watching
// config.watchFolders = [__dirname];
// config.resolver.blacklistRE = /(.*)\/(__tests__|android|ios|build|dist|.git|node_modules\/.*\/android|node_modules\/.*\/ios|node_modules\/.*\/windows|node_modules\/.*\/macos)(\/.*)?$/;

// // Alternative: use a more aggressive exclusion pattern
// config.resolver.blacklistRE = /node_modules\/.*\/(android|ios|windows|macos|__tests__|\.git|.*\.android\.js|.*\.ios\.js)$/;

// Reduce the number of workers to decrease resource usage
config.maxWorkers = 2;

module.exports = config;



/*// metro.config.js
const { getDefaultConfig } = require("expo/metro-config");
const path = require('path');
const { FileStore } = require('metro-cache');

const config = getDefaultConfig(__dirname);

// Use a stable on-disk store (shared across web/android)
const root = process.env.METRO_CACHE_ROOT || path.join(__dirname, '.metro-cache');
config.cacheStores = [
  new FileStore({ root: path.join(root, 'cache') }),
];

// CONFIGURAÇÃO DO PROXY PARA WEB
// Importante: config.server deve estar no nível correto
if (process.env.NODE_ENV === 'development') {
  config.server = {
    port: 8081,
    forwardClientLogs: true,
    proxy: {
      '/api': {
        target: 'http://localhost:8001',
        changeOrigin: true,
        secure: false,
        logLevel: 'debug',
        onProxyReq: (proxyReq, req, res) => {
          console.log(`[Proxy] ${req.method} ${req.url} -> ${proxyReq.path}`);
        },
      },
    },
  };
}

// Reduce the number of workers to decrease resource usage
config.maxWorkers = 2;

module.exports = config;





// metro.config.js
const { getDefaultConfig } = require("expo/metro-config");
const path = require('path');
const { FileStore } = require('metro-cache');

const config = getDefaultConfig(__dirname);

// Use a stable on-disk store (shared across web/android)
const root = process.env.METRO_CACHE_ROOT || path.join(__dirname, '.metro-cache');
config.cacheStores = [
  new FileStore({ root: path.join(root, 'cache') }),
];

// ADICIONE ESTA CONFIGURAÇÃO DE PROXY
// Para ambiente web, proxy as requisições /api para o backend
if (process.env.NODE_ENV === 'development') {
  config.server = config.server || {};
  config.server.forwardClientLogs = true;
  config.server.port = 8081; // porta do seu frontend Expo
  
  // Configuração do proxy
  config.server.proxy = {
    '/api': {
      target: 'http://localhost:8001', // SEU BACKEND NA PORTA 8001
      changeOrigin: true,
      secure: false,
      logLevel: 'debug',
    },
  };
}

// Reduce the number of workers to decrease resource usage
config.maxWorkers = 2;

module.exports = config;*/