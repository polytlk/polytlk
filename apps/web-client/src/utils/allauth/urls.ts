import type { BaseUrlType } from '#rootmachine/lib/env-schema';

type Client = 'app' | 'browser';

type BaseAuthUrl = `${BaseUrlType}/api/auth/_allauth/${Client}/v1`;

const getBaseAuthUrl: (props: {
  baseUrl: BaseUrlType;
  platform: 'ios' | 'web' | 'android';
}) => BaseAuthUrl = ({ platform, baseUrl }) => {
  const client = platform === 'web' ? 'browser' : 'app';

  return `${baseUrl}/api/auth/_allauth/${client}/v1`;
};

export { getBaseAuthUrl };
export type { BaseAuthUrl };
