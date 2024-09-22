import { AUTH_ENDPOINTS } from './internal/constants';

// endpoints and relevant frontend routes
const AUTH_URLS = {
  ...AUTH_ENDPOINTS,
  REDIRECT_CALLBACK: '/account/provider/callback',
} as const;

export { AUTH_URLS };
