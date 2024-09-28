import { useSelector } from '#rootmachine/index';

import { IonApp } from '@ionic/react';

import Router from './Router';

const App: React.FC = () => {
  const configLoading = useSelector(({ value }) => value === 'loading');
  const authLoading = useSelector(
    ({ context }) => context.allauth.auth === undefined
  );

  const isLoading = configLoading || authLoading;

  // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
  return isLoading ? (
    <div>loading</div>
  ) : (
    <IonApp>
      <Router />
    </IonApp>
  );
};

export default App;
