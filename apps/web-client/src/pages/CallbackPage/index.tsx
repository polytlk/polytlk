import { CapacitorHttp } from '@capacitor/core';
import React, { useEffect, useState } from 'react';

const Callback = () => {
  const [auth, setAuth] = useState(null);
  useEffect(() => {
    // Fetch configuration data on mount
    const fetchConfig = async () => {
      try {
        const { data } = await CapacitorHttp.get({
          url: 'http://localhost/api/auth/_allauth/browser/v1/auth/session',
        });
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        console.log('Full response:', data);
        console.log('Response data:', data.data);

        setAuth(data.data); // Set the config data from the API response
      } catch (err) {
        console.error('Error fetching config:', err);
      }
    };

    fetchConfig(); // Call the function to fetch config
  }, []);

  console.log('auth', auth);

  return <div>we did it reddit</div>;
};

export default Callback;
