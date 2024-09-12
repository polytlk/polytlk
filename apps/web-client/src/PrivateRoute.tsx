import type { ComponentType, FunctionComponent } from 'react';

import { Redirect, Route } from 'react-router-dom';

import { RootContext } from './RootContext';

type PrivateRouteProps = {
  component: ComponentType;
};

const PrivateRoute: FunctionComponent<
  PrivateRouteProps & Record<string, unknown>
> = ({ component: Component, ...rest }) => {
  const token = RootContext.useSelector(({ context }) => context.token);
  const checked = RootContext.useSelector(({ context }) => context.checked);

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
