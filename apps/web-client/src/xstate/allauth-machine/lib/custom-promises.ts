import type { BaseUrlType } from '#rootmachine/lib/env-schema';
import { fromPromise } from 'xstate';

import { CapacitorHttp } from '@capacitor/core';


// hashed token ex  -> token                      ->  eyJvcmciOiI1ZTlkOTU0NGExZGNkNjAwMDFkMGVkMjAiLCJpZCI6IjNCWEJyYzF6ejhKN1d3b1NUTkhLamVTWTRfNG1tb0ltTlJkOGJNZm8xcHciLCJoIjoibXVybXVyMTI4In0=
// unhashed form    -> JSON.parse(atob(token))    -> '{"org":"5e9d9544a1dcd60001d0ed20","id":"3BXBrc1zz8J7WwoSTNHKjeSY4_4mmoImNRd8bMfo1pw","h":"murmur128"}'
// token            -> JSON.parse(atob(token)).id -> 3BXBrc1zz8J7WwoSTNHKjeSY4_4mmoImNRd8bMfo1pw
export const fetchToken = fromPromise(
    async ({ input }: { input: BaseUrlType }) => {

        const url = `${input}/api/auth/testz/` as const;

        const { data, status } = await CapacitorHttp.get({
            url,
          });
    
        console.log('fetchToken -> data', data);

        return data.token
    }
  );
  