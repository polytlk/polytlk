import type { BaseAuthUrl } from '#allauth/urls';

import { AUTH_URLS } from '#allauth/constants';
import { deleteAllauthClientV1AuthSession401Response } from '#allauth/gen/endpoints/authentication-current-session/authentication-current-session.zod';
import { getAllauthClientV1Config200Response } from '#allauth/gen/endpoints/configuration/configuration.zod';
import { fromPromise } from 'xstate';

import { CapacitorHttp } from '@capacitor/core';

import { getSessionResponse } from './utils';

export const fetchSession = fromPromise(
  async ({ input }: { input: BaseAuthUrl }) => {
    const url = `${input}${AUTH_URLS.SESSION}` as const;

    const { data, status } = await CapacitorHttp.get({
      url,
    });

    if (status !== 200 && status !== 401 && status !== 410) {
      throw Error('unknown status for session');
    }

    if (status === 200) {
      const testUrl = 'http://localhost/api/auth/testz/' as const;
      const testResponse = await CapacitorHttp.get({
        url: testUrl,
      });

      console.log('fetchSession -> testResponse', testResponse);
    }

    return getSessionResponse(status, data);
  }
);

export const fetchConfig = fromPromise(
  async ({ input }: { input: BaseAuthUrl }) => {
    const url = `${input}${AUTH_URLS.CONFIG}` as const;

    const { data, status } = await CapacitorHttp.get({
      url,
    });

    if (status !== 200) {
      throw Error('unknown status for config');
    }

    const validResponse = getAllauthClientV1Config200Response.parse(data);
    return validResponse;
  }
);

export const deleteSession = fromPromise(
  async ({ input }: { input: BaseAuthUrl }) => {
    const url = `${input}${AUTH_URLS.SESSION}` as const;

    const { data, status } = await CapacitorHttp.delete({
      url,
    });

    if (status !== 401) {
      throw Error('unknown status for config');
    }

    const response = deleteAllauthClientV1AuthSession401Response.parse(data);
    return response;
  }
);
