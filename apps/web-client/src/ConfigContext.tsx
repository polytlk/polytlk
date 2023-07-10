import React from 'react';

import { ClientConfig } from './utils/config';

// Create a Context with default value as empty string
const ConfigContext = React.createContext<ClientConfig | null >(null);

export default ConfigContext;