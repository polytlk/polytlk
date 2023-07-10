import { IonGrid, IonRow, IonCol, IonImg } from '@ionic/react';
import { useState } from 'react'
import InterpretBar from './InterpretContainer';

import LanguageDataComponent from './LanguageDataComponent';


const ExploreContainer: React.FC = () => {
  const [taskResult, setTaskResult] = useState<string>('');

  const handleTaskResult = (result: string) => {
    setTaskResult(result);
  };


  return (
    <IonGrid fixed={true}>
      <IonRow><strong style={{ fontSize: "1.5em", textAlign: "center", width: "100%", marginTop: '4em' }}>Welcome to Polytlk. Please input chinese you want to understand.</strong></IonRow>
      <IonRow className="ion-align-items-center" style={{ 'margin': "2em" }}>
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
      <InterpretBar onTaskResult={handleTaskResult} />
    </IonGrid >
  );
};

export default ExploreContainer;
