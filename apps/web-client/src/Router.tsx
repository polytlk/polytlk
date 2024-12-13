import { Redirect, Route } from 'react-router-dom';

import { IonRouterOutlet } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';

import CallbackPage from './pages/CallbackPage';
import Home from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import PrivateRoute from './PrivateRoute'; // import the PrivateRoute component

const Router: React.FC = () => {
  return (
    <IonReactRouter>
      <IonRouterOutlet>
        <PrivateRoute exact path="/home" component={Home} />
        <Route exact path="/account/login">
          <LoginPage />
        </Route>
        <Route exact path="/account/signup">
          <SignupPage />
        </Route>
        <Route exact path="/account/provider/callback">
          <CallbackPage />
        </Route>
        <Route exact path="/">
          <Redirect to="/home" />
        </Route>
      </IonRouterOutlet>
    </IonReactRouter>
  );
};

export default Router;
