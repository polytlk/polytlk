type ErrorCode =
  | 'invalid_request'
  | 'access_denied'
  | 'unauthorized_client'
  | 'unsupported_response_type'
  | 'invalid_scope'
  | 'server_error'
  | 'temporarily_unavailable';

export type CodeResponse = {
  /** The authorization code of a successful token response */
  code: string;
  /**	A space-delimited list of [scopes](https://developers.google.com/identity/protocols/oauth2/scopes) that are approved by the user */
  scope: string;
  /**	The string value that your application uses to maintain state between your authorization request and the response */
  state?: string;
  /**	A single ASCII error code */
  error?: ErrorCode;
  /** Human-readable ASCII text providing additional information, used to assist the client developer in understanding the error that occurred */
  error_description?: string;
  /** A URI identifying a human-readable web page with information about the error, used to provide the client developer with additional information about the error */
  error_uri?: string;
};

export type TokenResponse = {
  /** The access token of a successful token response. */
  access_token: string;
  /** The lifetime in seconds of the access token. */
  expires_in: number;
  /** The hosted domain the signed-in user belongs to. */
  hd?: string;
  /** The prompt value that was used from the possible list of values specified by TokenClientConfig or OverridableTokenClientConfig */
  prompt: string;
  /** The type of the token issued. */
  token_type: string;
  /** A space-delimited list of [scopes](https://developers.google.com/identity/protocols/oauth2/scopes) that are approved by the user. */
  scope: string;
  /** The string value that your application uses to maintain state between your authorization request and the response. */
  state?: string;
  /** A single ASCII error code. */
  error?: ErrorCode;
  /**	Human-readable ASCII text providing additional information, used to assist the client developer in understanding the error that occurred. */
  error_description?: string;
  /** A URI identifying a human-readable web page with information about the error, used to provide the client developer with additional information about the error. */
  error_uri?: string;
};
