import type { FC } from 'react';

import { CapacitorHttp } from '@capacitor/core';
import {
  IonButton,
  IonCol,
  IonContent,
  IonGrid,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonListHeader,
  IonPage,
  IonRow,
  IonText,
  IonTitle,
  IonToolbar,
  useIonViewWillEnter,
} from '@ionic/react';
import { logoGoogle } from 'ionicons/icons';
import React, { useState } from 'react';
import { z } from 'zod';

import { getAllauthClientV1ConfigResponse } from '../../utils/allauth/gen/endpoints/configuration/configuration.zod';

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

const Signup: FC = () => {
  const [config, setConfig] =
    useState<getAllauthClientV1ConfigResponseType | null>(null);
  const [error, setError] = useState<string>('');

  useIonViewWillEnter(() => {
    const fetchConfig = async () => {
      try {
        const rawResponse = await CapacitorHttp.get({
          url: 'http://localhost/api/auth/_allauth/browser/v1/config',
        });
        const validResponse = getAllauthClientV1ConfigResponse.parse(
          rawResponse.data
        );

        setConfig(validResponse);
      } catch (err) {
        setError('Failed to load configuration. Please try again later.');
        console.error('Error fetching config:', err);
      }
    };

    fetchConfig(); // Call the function to fetch config
  });

  // Example function to handle provider login (adjust as needed for real login flow)
  const handleProviderLogin = (provider: { id: string }) => {
    const callback_url = '/account/provider/callback';

    const r = postForm(
      'http://localhost/api/auth/_allauth/browser/v1/auth/provider/redirect',
      {
        provider: provider.id,
        process: 'login',
        callback_url,
        // csrfmiddlewaretoken: cook,
      }
    );
  };

  // If there's an error, show an error message
  if (error !== '') {
    console.log('error', error);
    return (
      <IonPage>
        <div className="error">{error}</div>;
      </IonPage>
    );
  }

  // If config is not yet loaded, show a loading message
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (config === null) {
    console.log('no config');
    return (
      <IonPage>
        <div>Loading...</div>;
      </IonPage>
    );
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle> Sign Up </IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonGrid>
          <IonRow>
            <IonCol />
            <IonCol size="4">
              <IonButton
                fill="clear"
                routerLink="/account/login"
                routerDirection="forward"
              >
                <IonLabel>already have an account? login here</IonLabel>
              </IonButton>
            </IonCol>
            <IonCol />
          </IonRow>
          {config.data.socialaccount !== undefined && (
            <IonRow>
              <IonCol />
              <IonCol size="4">
                <IonList inset={true}>
                  <IonListHeader>
                    <IonLabel> Third Party </IonLabel>
                  </IonListHeader>

                  {config.data.socialaccount.providers.map((provider) => (
                    <IonButton
                      color="primary"
                      fill="outline"
                      key={provider.id}
                      onClick={() => handleProviderLogin(provider)}
                    >
                      <IonIcon icon={logoGoogle} slot="start" />
                      <IonLabel>Sign up with {provider.name}</IonLabel>
                    </IonButton>
                  ))}
                </IonList>
              </IonCol>
              <IonCol />
            </IonRow>
          )}
        </IonGrid>
      </IonContent>
    </IonPage>
  );
};

export default Signup;
