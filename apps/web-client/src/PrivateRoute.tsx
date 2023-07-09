import { Route, Redirect } from 'react-router-dom';
import type { ComponentType, FunctionComponent } from 'react';

import { useContext } from 'react';
import AuthContext from './AuthContext';
import { EchoPlugin } from '@polytlk/echo-plugin';


interface PrivateRouteProps {
    component: ComponentType;
    [x: string]: any;  // To accept rest of the properties same as Route component
}

const PrivateRoute: FunctionComponent<PrivateRouteProps> = ({ component: Component, ...rest }) => {
    const { token } = useContext(AuthContext);
    EchoPlugin.echo({ value: `PrivateRoute -> token -> ${token}` })
  
    return (
      <Route {...rest} >
        {token ? <Component /> : <Redirect to="/login" />}
      </Route>
    );
  };
  
  export default PrivateRoute;