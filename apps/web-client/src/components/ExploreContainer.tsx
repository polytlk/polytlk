import { IonGrid, IonRow, IonCol, IonImg } from '@ionic/react';
import { useState, useEffect } from 'react'
import InterpretBar from './InterpretContainer';


import type { ClientConfig } from '../utils/config'
import Config from '../utils/config'
import LanguageDataComponent from './LanguageDataComponent';


const ExploreContainer: React.FC<Record<string, never>> = () => {
  const [taskResult, setTaskResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [config, setConfig] = useState<ClientConfig | null>(null);

  useEffect(() => {
    const fetchConfig = async () => {
      const config = await Config.getInstance();
      setConfig(config.get());
      setIsLoading(false);
    }

    fetchConfig();
  }, []);


  const handleTaskResult = (result: string) => {
    setTaskResult(result);
  };

  if (isLoading || !config) {
    return <p>Loading...</p>;
  }

  return (
    <IonGrid fixed={true}>
      <IonRow><strong style={{ fontSize: "1.5em", textAlign: "center", width: "100%", marginTop: '4em' }}>Welcome to Polytlk. Please input chinese you want to understand.</strong></IonRow>
      <IonRow className="ion-align-items-center" style={{'margin': "2em"}}>
        {taskResult
          ? <LanguageDataComponent data={JSON.parse(taskResult)} />
          : <>
            <IonCol size='3'></IonCol>
            <IonCol size="6" className="ion-padding-top ion-padding-bottom">
              <IonImg src="https://source.unsplash.com/random/800x600" alt="Your Description" style={{ width: '100%', height: '200px', objectFit: 'cover', margin: 'auto' }} />
            </IonCol>
            <IonCol size='3'></IonCol>
          </>
        }
      </IonRow>
      <InterpretBar onTaskResult={handleTaskResult} config={config} />
    </IonGrid >
  );
};

export default ExploreContainer;
