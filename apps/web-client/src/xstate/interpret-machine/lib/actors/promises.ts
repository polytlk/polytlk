import { fromPromise } from 'xstate';

import { CapacitorHttp } from '@capacitor/core';

import { chineseEndpointInterpretationPostResponse } from '../gen/zod';

export const interpretationFetcher = fromPromise(
  async ({
    input,
  }: {
    input: { baseUrl: string; text: string; token: string };
  }): Promise<string> => {
    const response = await CapacitorHttp.post({
      url: `${input.baseUrl}/api/chinese/interpretation`,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${input.token}`,
      },
      data: { user_input: input.text },
    });

    if (response.status === 200) {
      const { task_id } = chineseEndpointInterpretationPostResponse.parse(
        response.data
      );

      return task_id;
    }

    if (response.status === 403 || 401) {
      throw Error('Access to this API has been disallowed');
    }

    throw Error('something');
  }
);
