import { useHistory } from 'react-router-dom';
import React, { useContext } from 'react';
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonButton } from '@ionic/react';
import { OAuth2Client } from "@byteowls/capacitor-oauth2";
import AuthContext from './AuthContext';

const OAUTH_WEB_APP_ID = '540933041586-61juofou98dd54ktk134ktfec2c84gd3.apps.googleusercontent.com'

const LoginPage: React.FC = () => {
  const { setToken } = useContext(AuthContext);
  const history = useHistory();

  const googleLogin = () => {
    OAuth2Client.authenticate({
      authorizationBaseUrl: "https://accounts.google.com/o/oauth2/auth",
      accessTokenEndpoint: "https://www.googleapis.com/oauth2/v4/token",
      scope: "email profile",
      resourceUrl: "https://www.googleapis.com/userinfo/v2/me",
      web: {
        appId: OAUTH_WEB_APP_ID,
        responseType: "token", // implicit flow
        accessTokenEndpoint: "", // clear the tokenEndpoint as we know that implicit flow gets the accessToken from the authorizationRequest
        redirectUrl: "http://localhost:4200",
        windowOptions: "height=600,left=0,top=0"
      },
      // ios: {
      //   appId: environment.oauthAppId.google.ios,
      //   responseType: "code", // if you configured a ios app in google dev console the value must be "code"
      //   redirectUrl: "com.companyname.appname:/" // Bundle ID from google dev console
      // }
    }).then(resourceUrlResponse => {
      const { access_token, ...rest } = resourceUrlResponse;
      setToken(access_token);
      console.log("rest", rest)
      history.push('/home');  // <-- redirect to home
    }).catch(reason => {
      console.error("Google OAuth rejected", reason);
    });
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
