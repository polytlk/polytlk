import type { ComponentType, FunctionComponent } from 'react';

import { useContext } from 'react';
import { Redirect, Route } from 'react-router-dom';

import AuthContext from './AuthContext';

type PrivateRouteProps = {
  component: ComponentType;
};

const PrivateRoute: FunctionComponent<
  PrivateRouteProps & Record<string, unknown>
> = ({ component: Component, ...rest }) => {
  const { token, loading } = useContext(AuthContext);

  if (loading) {
    return null;
  }

  return (
    <Route {...rest}>
      {token !== '' ? <Component /> : <Redirect to="/login" />}
    </Route>
  );
};

export default PrivateRoute;
