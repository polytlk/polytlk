import { IonRouterOutlet } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { Redirect, Route } from 'react-router-dom';

import CallbackPage from './pages/CallbackPage';
import Home from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import PrivateRoute from './PrivateRoute'; // import the PrivateRoute component
import { RootContext } from './RootContext';

const { useSelector } = RootContext;

const Router: React.FC = () => {
  const configLoading = useSelector(({ value }) => value === 'loading');

  return configLoading ? null : (
    <IonReactRouter>
      <IonRouterOutlet>
        <PrivateRoute exact path="/home" component={Home} />
        <Route exact path="/login">
          <LoginPage />
        </Route>
        <Route exact path="/signup">
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
