import { useHistory } from 'react-router-dom';
import React, { useContext } from 'react';
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonButton } from '@ionic/react';
import { OAuth2Client } from "@byteowls/capacitor-oauth2";
import AuthContext from './AuthContext';
import ConfigContext from './ConfigContext';

const LoginPage: React.FC = () => {
  const { setToken } = useContext(AuthContext);
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const config = useContext(ConfigContext)!
  const history = useHistory();

  const googleLogin = async () => {
    console.log("googleLogin -> calling")
    const { access_token } = await OAuth2Client.authenticate(config.oAuth2AuthOpts).catch((e) => { console.log("error happened authing", e)})
    console.log("googleLogin -> access_token", access_token)

    const url = `${config.baseUrl}/api/auth/exchange/`

    console.log("googleLogin -> calling heimdall", url)
    // Here, make the fetch request to /api/exchange
    const rawExchangeResponse = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        access_token: access_token,
      }),
    })

    const { token } = await rawExchangeResponse.json()

    if (token) {
      const keyData = JSON.parse(atob(token))
      setToken(keyData.id);
      history.push('/home');
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Login</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <IonButton expand="full" onClick={googleLogin}>
          Login with Google
        </IonButton>
      </IonContent>
    </IonPage>
  );
};

export default LoginPage;
