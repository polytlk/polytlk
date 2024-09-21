import type { FunctionComponent } from 'react';
import type { RouteProps } from 'react-router-dom';

import { IonPage, useIonRouter, useIonViewWillEnter } from '@ionic/react';
import { Route } from 'react-router-dom';

import { RootContext } from './RootContext';

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
  const token = RootContext.useSelector(({ context }) => context.token);
  return (
    <Route {...rest} component={token !== '' ? Component : ProtectedPage} />
  );
};

export default PrivateRoute;
