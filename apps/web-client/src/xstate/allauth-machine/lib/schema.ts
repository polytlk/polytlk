import {
  getAllauthClientV1AuthSession200Response,
  getAllauthClientV1AuthSession401Response,
  getAllauthClientV1AuthSession410Response,
} from '#allauth/gen/endpoints/authentication-current-session/authentication-current-session.zod';
import { getAllauthClientV1Config200Response } from '#allauth/gen/endpoints/configuration/configuration.zod';
import { z } from 'zod';

export const sessionResponseSchema = z.discriminatedUnion('status', [
  getAllauthClientV1AuthSession200Response,
  getAllauthClientV1AuthSession401Response,
  getAllauthClientV1AuthSession410Response,
]);

type SessionResponseType = z.infer<typeof sessionResponseSchema>;
type ConfigResponseType = z.infer<typeof getAllauthClientV1Config200Response>;

export type { ConfigResponseType, SessionResponseType };
