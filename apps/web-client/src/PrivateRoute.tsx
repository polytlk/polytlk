import type { FunctionComponent } from 'react';
import type { RouteProps } from 'react-router-dom';

import { useSelector } from '#rootmachine/index';
import { Route } from 'react-router-dom';

import { IonPage, useIonRouter, useIonViewWillEnter } from '@ionic/react';

type PrivateRouteProps = Omit<RouteProps, 'component'> & {
  component: FunctionComponent;
};

const ProtectedPage = () => {
  const router = useIonRouter();

  useIonViewWillEnter(() => {
    router.push('/account/login', 'forward', 'replace', { unmount: true });
  }, [router]);

  return <IonPage></IonPage>;
};

const PrivateRoute: FunctionComponent<PrivateRouteProps> = ({
  component: Component,
  ...rest
}) => {
  const isAuthenticated = useSelector(({ context }) =>
    Boolean(context.allauth.auth?.meta.is_authenticated)
  );
  return (
    <Route {...rest} component={isAuthenticated ? Component : ProtectedPage} />
  );
};

export default PrivateRoute;
