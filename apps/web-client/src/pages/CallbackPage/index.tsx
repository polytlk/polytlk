import { CapacitorHttp } from '@capacitor/core';
import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonPage,
  IonTitle,
  IonToolbar,
} from '@ionic/react';
import { logOutOutline } from 'ionicons/icons';
import React, { FC, useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { z } from 'zod';

import { getAllauthClientV1AuthSessionResponse } from '../../utils/allauth/gen/endpoints/authentication-current-session/authentication-current-session.zod';
import { getAllauthClientV1ConfigResponse } from '../../utils/allauth/gen/endpoints/configuration/configuration.zod';

const deleteAllauthClientV1AuthSessionResponse = z.object({
  data: z.unknown({}),
  meta: z.object({
    is_authenticated: z.literal(false),
  }),
});

const allAuthClientV1AuthSessionResponse = z.discriminatedUnion(
  'is_authenticated',
  [
    deleteAllauthClientV1AuthSessionResponse.extend({
      is_authenticated: z.literal(false),
    }),
    getAllauthClientV1AuthSessionResponse.extend({
      is_authenticated: z.literal(true),
    }),
  ]
);

type allauthClientV1AuthSessionResponseType = z.infer<
  typeof allAuthClientV1AuthSessionResponse
>;
type getAllauthClientV1ConfigResponseType = z.infer<
  typeof getAllauthClientV1ConfigResponse
>;

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

const handleProviderLogin = (provider: { id: string }) => {
  // In a real application, this could be a redirect or an API call to initiate provider login

  const callback_url = '/account/provider/callback';
  //const callback_url = '';
  //const callback_url = 'api/auth/accounts/google/callback/'

  postForm(
    'http://localhost/api/auth/_allauth/browser/v1/auth/provider/redirect',
    {
      provider: provider.id,
      process: 'login',
      callback_url,
      // csrfmiddlewaretoken: cook,
    }
  );
};

const AuthButtons: FC<{
  isAuth: boolean;
  handleLogout: () => void;
  config: getAllauthClientV1ConfigResponseType;
}> = ({ isAuth, handleLogout, config }) => {
  if (isAuth) {
    return (
      <IonButton color="danger" onClick={handleLogout}>
        LOGOUT
        <IonIcon icon={logOutOutline} />
      </IonButton>
    );
  }

  return (
    <>
      <IonButton
        color="primary"
        onClick={() => {
          console.log('login');
        }}
      >
        Login
        <IonIcon icon={logOutOutline} />
      </IonButton>
      {config.data.socialaccount?.providers != null &&
        config.data.socialaccount.providers.map(({ id, name }) => {
          return (
            <IonButton
              key={id}
              color="primary"
              onClick={() => handleProviderLogin({ id })}
            >
              {name}
              <IonIcon icon={logOutOutline} />
            </IonButton>
          );
        })}
    </>
  );
};

const Callback = () => {
  const [auth, setAuth] =
    useState<allauthClientV1AuthSessionResponseType | null>(null);
  const [config, setConfig] =
    useState<getAllauthClientV1ConfigResponseType | null>(null);
  const history = useHistory();

  useEffect(() => {
    // Fetch configuration data on mount
    const fetchAuth = async () => {
      try {
        const { data } = await CapacitorHttp.get({
          url: 'http://localhost/api/auth/_allauth/browser/v1/auth/session',
        });

        const validResponse = allAuthClientV1AuthSessionResponse.parse({
          ...data,
          is_authenticated: data.meta.is_authenticated,
        });

        setAuth(validResponse); // Set the config data from the API response
      } catch (err) {
        console.error('Error fetching config:', err);
      }
    };

    const fetchConfig = async () => {
      try {
        const rawResponse = await CapacitorHttp.get({
          url: 'http://localhost/api/auth/_allauth/browser/v1/config',
        });

        console.log('raw data', rawResponse.data);

        const validResponse = getAllauthClientV1ConfigResponse.parse(
          rawResponse.data
        );

        setConfig(validResponse); // Set the config data from the API response
      } catch (err) {
        console.error('Error fetching config:', err);
      }
    };

    fetchAuth();
    fetchConfig();
  }, []);

  const handleLogout = async () => {
    try {
      const rawResponse = await CapacitorHttp.delete({
        url: 'http://localhost/api/auth/_allauth/browser/v1/auth/session',
      });

      const validResponse = deleteAllauthClientV1AuthSessionResponse.parse(
        rawResponse.data
      );

      setAuth({ ...validResponse, is_authenticated: false }); // Set the config data from the API response
    } catch (err) {
      console.error('Error fetching config:', err);
    }
  };

  if (auth == null || config == null) {
    return (
      <IonPage>
        <div>loading</div>
      </IonPage>
    );
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>
            Auth {auth.meta.is_authenticated ? 'success' : 'auth failure'}
          </IonTitle>
          <IonButtons slot="end">
            <AuthButtons
              isAuth={auth.meta.is_authenticated}
              handleLogout={handleLogout}
              config={config}
            />
          </IonButtons>
        </IonToolbar>
        <IonContent>
          {auth.meta.is_authenticated ? (
            <div>youre in</div>
          ) : (
            <div> you are not authenticated </div>
          )}
        </IonContent>
      </IonHeader>
    </IonPage>
  );
};

export default Callback;
