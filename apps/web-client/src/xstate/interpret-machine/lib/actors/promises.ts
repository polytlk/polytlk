import { fromPromise } from 'xstate';

import { CapacitorHttp } from '@capacitor/core';

import { chineseEndpointInterpretationPostResponse } from '../gen/zod';
import type { queriesResponseType } from './schema'
import { queriesResponse } from './schema'

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

export const queriesFetcher = fromPromise(
  async ({
    input,
  }: {
    input: { baseUrl: string; token: string };
  }): Promise<queriesResponseType> => {
    const { data} = await CapacitorHttp.get({
      url: `${input.baseUrl}/api/chinese/queries`,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${input.token}`,
      },
    });

    const response = queriesResponse.parse(data)

    console.log("queriesFetcher -> response", response)

    return response

  }
);
