import type { FC, RefObject } from 'react';

import {
  IonButton,
  IonCol,
  IonContent,
  IonGrid,
  IonHeader,
  IonLabel,
  IonMenuButton,
  IonPage,
  IonRow,
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
      <IonGrid>
        <IonRow>
          <IonCol />
          <IonCol size="4">
            <IonButton
              fill="clear"
              routerLink="/account/signup"
              routerDirection="forward"
            >
              <IonLabel>Don't an account? signup here</IonLabel>
            </IonButton>
          </IonCol>
          <IonCol />
        </IonRow>
        <IonRow>
          <IonCol>
            <IonButton ref={buttonRef}></IonButton>
          </IonCol>
        </IonRow>
      </IonGrid>
    </IonContent>
  </IonPage>
);
