module.exports = (api) => {
    // This caches the Babel config
    api.cache.using(() => process.env.NODE_ENV);
    return {
      presets: [
        // Enable development transform of React with new automatic runtime
        ['@babel/preset-typescript', { onlyRemoveTypeImport: true }],
        [
          '@babel/preset-react',
          { development: !api.env('production'), runtime: 'automatic' },
        ],
      ],
      // Applies the react-refresh Babel plugin on non-production modes only
      ...(!api.env('production') && { plugins: ['react-refresh/babel'] }),
    };
  };
  