import './Home.css';

import {
  IonContent,
  IonHeader,
  IonMenuButton,
  IonPage,
  IonTitle,
  IonToolbar,
} from '@ionic/react';

import ExploreContainer from '../components/ExploreContainer';

const Home: React.FC = () => {
  return (
    <IonPage id="main">
      <IonHeader>
        <IonToolbar>
          <IonTitle>Interpret</IonTitle>
          <IonMenuButton autoHide={false} slot="end" />
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Interpret</IonTitle>
            <IonMenuButton autoHide={false} slot="end" />
          </IonToolbar>
        </IonHeader>
        <ExploreContainer />
      </IonContent>
    </IonPage>
  );
};

export default Home;
