import {
  getAllauthClientV1AuthSession200Response,
  getAllauthClientV1AuthSession401Response,
  getAllauthClientV1AuthSession410Response,
} from '#allauth/gen/endpoints/authentication-current-session/authentication-current-session.zod';

export const getSessionResponse = (status: 200 | 401 | 410, data: unknown) => {
  switch (status) {
    case 200:
      return getAllauthClientV1AuthSession200Response.parse(data);
    case 401:
      return getAllauthClientV1AuthSession401Response.parse(data);
    case 410:
      return getAllauthClientV1AuthSession410Response.parse(data);
  }
};
