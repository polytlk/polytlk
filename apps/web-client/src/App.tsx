import { Redirect, Route } from 'react-router-dom';
import { IonApp, IonRouterOutlet, setupIonicReact } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import PrivateRoute from './PrivateRoute'; // import the PrivateRoute component
import Home from './pages/Home';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/* Theme variables */
import './theme/variables.css';

import DebugSidebar from './components/DebugSidebar';
import { useEffect, useRef, useState } from 'react'
import { inspect } from "@xstate/inspect";
import { IframeContext } from './context'
import AuthContext from './AuthContext';
import LoginPage from './LoginPage';
import type { ClientConfig } from './utils/config'
import Config from './utils/config'
import ConfigContext from './ConfigContext';

setupIonicReact();

const App: React.FC = () => {
  const iframeRef = useRef<HTMLIFrameElement>(document.getElementById("xstate-inspector") as HTMLIFrameElement);
  const [token, setToken] = useState('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [config, setConfig] = useState<ClientConfig | null>(null);


  useEffect(() => {
    if (iframeRef.current) {
      inspect({
        iframe: iframeRef.current,
      });
    }
  }, []);

  useEffect(() => {
    const fetchConfig = async () => {
      const config = await Config.getInstance();
      setConfig(config.get());
      setIsLoading(false);
    }

    fetchConfig();
  }, []);

  if (isLoading || !config) {
    return <p>Loading...</p>;
  }

  return (
    <ConfigContext.Provider value={config}>
      <AuthContext.Provider value={{ token, setToken }}>
        <IframeContext.Provider value={iframeRef}>
          <IonApp>
            <IonReactRouter>
              <IonRouterOutlet>
                <PrivateRoute exact path="/home" component={Home} />
                <Route exact path='/login'>
                  <LoginPage />
                </Route>
                <Route exact path="/">
                  <Redirect to="/home" />
                </Route>
              </IonRouterOutlet>
              <DebugSidebar />
            </IonReactRouter>
          </IonApp>
        </IframeContext.Provider>
      </AuthContext.Provider>
    </ConfigContext.Provider>

  )
};

export default App;
