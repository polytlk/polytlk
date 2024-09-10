import type { ComponentType, FunctionComponent } from 'react';

import { Redirect, Route } from 'react-router-dom';

import { AuthContext } from './AuthContext';

type PrivateRouteProps = {
  component: ComponentType;
};

const PrivateRoute: FunctionComponent<
  PrivateRouteProps & Record<string, unknown>
> = ({ component: Component, ...rest }) => {
  const token = AuthContext.useSelector(({ context }) => context.token);
  const checked = AuthContext.useSelector(({ context }) => context.checked);

  if (!token && !checked) {
    return null;
  }

  return (
    <Route {...rest}>
      {token !== '' ? <Component /> : <Redirect to="/login" />}
    </Route>
  );
};

export default PrivateRoute;
