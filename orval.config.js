module.exports = {
    allauth: {
        output: {
            client: 'fetch',
            mode: 'tags-split',
            target: './apps/web-client/src/utils/allauth/gen/endpoints',
            schemas: './apps/web-client/src/utils/allauth/gen/models',
            //override: {
            //    mutator: {
            //      path: './apps/web-client/src/utils/allauth/custom-client.ts',
            //      name: 'customInstance',
            //    },
            //  },
        },
        input: {
            target: './apps/web-client/src/utils/allauth/openapi.json',
            filters: {
                tags: ['Authentication: Account', 'Authentication: Current Session'],
            },
        },
        hooks: {
            afterAllFilesWrite: { 
              command: 'pnpm nx run web-client:lint --fix',
              injectGeneratedDirsAndFiles: false,
            },
          },
    },
    allauthZod: {
        output: {
            client: 'zod',
            mode: 'tags-split',
            target: './apps/web-client/src/utils/allauth/gen/endpoints',
            fileExtension: '.zod.ts',
            override: {
                zod: {
                  generateEachHttpStatus: true,
                },
            },
        },
        input: {
            target: './apps/web-client/src/utils/allauth/openapi.json',
            filters: {
                tags: ['Authentication: Account', 'Authentication: Current Session', 'Configuration'],
            },
        },
        hooks: {
            afterAllFilesWrite: { 
              command: 'pnpm nx run web-client:lint --fix',
              injectGeneratedDirsAndFiles: false,
            },
          },
    },
};