import { useSelector } from '#rootmachine/index';
import React from 'react';
import { useLocation } from 'react-router-dom';

import {
  IonButton,
  IonContent,
  IonHeader,
  IonPage,
  IonText,
  IonTitle,
  IonToolbar,
  useIonRouter,
  useIonViewWillEnter,
} from '@ionic/react';

const Callback = () => {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const error = params.get('error');
  const auth = useSelector(({ context }) => context.allauth.auth);
  const router = useIonRouter();

  useIonViewWillEnter(() => {
    if (error === null) {
      router.push('/home', 'forward', 'push', { unmount: true });
    }
  });

  if (auth === undefined) return null;

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Third Party Failure</IonTitle>
        </IonToolbar>
        <IonContent>
          <IonText> Something went wrong </IonText>
          <IonButton
            onClick={() => {
              router.push('/account/login');
            }}
          >
            Continue{' '}
          </IonButton>
        </IonContent>
      </IonHeader>
    </IonPage>
  );
};

export default Callback;
