import type { FC, RefObject } from 'react';

import {
  IonContent,
  IonHeader,
  IonMenuButton,
  IonPage,
  IonTitle,
  IonToolbar,
} from '@ionic/react';

type LoginPageProps = {
  buttonRef: RefObject<HTMLButtonElement>; // Add a prop type for the ref
};

export const LoginPage: FC<LoginPageProps> = ({ buttonRef }) => (
  <IonPage>
    <IonHeader>
      <IonToolbar>
        <IonTitle>Login</IonTitle>
        <IonMenuButton slot="end" />
      </IonToolbar>
    </IonHeader>
    <IonContent className="ion-padding">
      <button ref={buttonRef} />
    </IonContent>
  </IonPage>
);
