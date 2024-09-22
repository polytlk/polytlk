import type { FC } from 'react';

import { AUTH_URLS } from '#allauth/constants';
import { postForm } from '#allauth/handlers';
import { getBaseAuthUrl } from '#allauth/urls';
import { useSelector } from '#rootmachine/index';
import { logoGoogle } from 'ionicons/icons';
import React from 'react';

import {
  IonButton,
  IonCol,
  IonContent,
  IonGrid,
  IonHeader,
  IonIcon,
  IonLabel,
  IonList,
  IonListHeader,
  IonPage,
  IonRow,
  IonTitle,
  IonToolbar,
} from '@ionic/react';

const Signup: FC = () => {
  const platform = useSelector(({ context }) => context.platform);
  const baseUrl = useSelector(({ context }) => context.config.BASE_URL);
  const config = useSelector(({ context }) => context.allauth.config);

  const baseAuthUrl = getBaseAuthUrl({ baseUrl, platform });

  // Example function to handle provider login (adjust as needed for real login flow)
  const handleProviderLogin = (providerId: string) => {
    const url = `${baseAuthUrl}${AUTH_URLS.REDIRECT_TO_PROVIDER}` as const;

    postForm(url, {
      provider: providerId,
      process: 'login',
      callback_url: AUTH_URLS.REDIRECT_CALLBACK,
      // csrfmiddlewaretoken: cook,
    });
  };

  if (config === undefined) return null;
  const { data } = config;

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
          {data.socialaccount !== undefined && (
            <IonRow>
              <IonCol />
              <IonCol size="4">
                <IonList inset={true}>
                  <IonListHeader>
                    <IonLabel> Third Party </IonLabel>
                  </IonListHeader>

                  {data.socialaccount.providers.map((provider) => (
                    <IonButton
                      color="primary"
                      fill="outline"
                      key={provider.id}
                      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
                      onClick={() => handleProviderLogin(provider.id)}
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
