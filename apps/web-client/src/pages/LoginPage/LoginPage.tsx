import type { FC } from 'react';
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonButton } from '@ionic/react';

interface LoginPageProps {
  newGoogleLogin: () => void;
}

export const LoginPage: FC<LoginPageProps> = ({ newGoogleLogin }) => (
  <IonPage>
    <IonHeader>
      <IonToolbar>
        <IonTitle>Login</IonTitle>
      </IonToolbar>
    </IonHeader>
    <IonContent className="ion-padding">
      <IonButton expand="full" onClick={newGoogleLogin}>
        Login with Google
      </IonButton>
    </IonContent>
  </IonPage>
);

