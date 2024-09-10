
import { fromPromise } from 'xstate';
import { CapacitorHttp } from '@capacitor/core';

export const interpretationFetcher = fromPromise(async ({ input }: { input: { baseUrl: string, text: string, token: string } }) => {
    const response = await CapacitorHttp.post({
      url: `${input.baseUrl}/api/chinese/interpretation`,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${input.token}`,
      },
      data: { user_input: input.text },
    });
  
    return response
  })