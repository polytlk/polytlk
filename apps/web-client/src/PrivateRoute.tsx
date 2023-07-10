import type { ComponentType, FunctionComponent } from 'react';

import { useContext } from 'react';
import { Redirect,Route } from 'react-router-dom';

import AuthContext from './AuthContext';


interface PrivateRouteProps {
    component: ComponentType;
}

const PrivateRoute: FunctionComponent<PrivateRouteProps & Record<string, unknown>> = ({ component: Component, ...rest }) => {
    const { token } = useContext(AuthContext);
    console.log({ value: `PrivateRoute -> token -> ${token}` })
  
    return (
      <Route {...rest} >
        {token ? <Component /> : <Redirect to="/login" />}
      </Route>
    );
  };
  
  export default PrivateRoute;