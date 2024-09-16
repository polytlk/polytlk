import { CapacitorHttp } from '@capacitor/core';
import React, { useEffect, useState } from 'react';

function getCookie(name: string) {
  let cookieValue = null;
  // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
  if (document.cookie && document.cookie !== '') {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i]?.trim();
      // Does this cookie string begin with the name we want?
      if (cookie && cookie.substring(0, name.length + 1) === name + '=') {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
}

function getCSRFToken() {
  return getCookie('csrftoken');
}

function postForm(action: string, data: Record<string, string>) {
  const f = document.createElement('form');
  f.method = 'POST';
  f.action = action;

  for (const key in data) {
    console.log('key', key);
    console.log('value', data[key]);
    const d = document.createElement('input');
    d.type = 'hidden';
    d.name = key;
    d.value = data[key] || '';
    f.appendChild(d);
  }
  document.body.appendChild(f);
  f.submit();
}

const Signup = () => {
  const [config, setConfig] = useState(null);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    // Fetch configuration data on mount
    const fetchConfig = async () => {
      try {
        const { data } = await CapacitorHttp.get({
          url: 'http://localhost/api/auth/_allauth/browser/v1/config',
        });
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        console.log('Full response:', data);
        console.log('Response data:', data.data);

        setConfig(data.data); // Set the config data from the API response
      } catch (err) {
        setError('Failed to load configuration. Please try again later.');
        console.error('Error fetching config:', err);
      }
    };

    fetchConfig(); // Call the function to fetch config
  }, []);

  // Example function to handle provider login (adjust as needed for real login flow)
  const handleProviderLogin = (provider: { id: string }) => {
    console.log('provider', provider);
    console.log(`Redirecting to login with provider: ${provider.id}`);
    // In a real application, this could be a redirect or an API call to initiate provider login

    // /auth/provider/redirect
    //
    // login
    const cook = getCSRFToken();
    console.log('cookie', cook);

    const callback_url = '/account/provider/callback';
    //const callback_url = '';
    //const callback_url = 'api/auth/accounts/google/callback/'

    const r = postForm(
      'http://localhost/api/auth/_allauth/browser/v1/auth/provider/redirect',
      {
        provider: provider.id,
        process: 'login',
        callback_url,
        // csrfmiddlewaretoken: cook,
      }
    );

    console.log('r', r);
  };

  // If there's an error, show an error message
  if (error !== '') {
    return <div className="error">{error}</div>;
  }

  console.log('config', config);
  // If config is not yet loaded, show a loading message
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (!config) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>Sign Up</h1>
      {/** @ts-expect-error adsdasds */}
      {config.socialaccount.providers.map((provider) => (
        <button key={provider.id} onClick={() => handleProviderLogin(provider)}>
          Sign up with {provider.name}
        </button>
      ))}
    </div>
  );
};

export default Signup;
