import type { UserInterpretEvents } from 'xstate/machines/root-machine';

import {
  IonButton,
  IonCol,
  IonContent,
  IonGrid,
  IonHeader,
  IonIcon,
  IonInput,
  IonItem,
  IonLabel,
  IonLoading,
  IonPage,
  IonRow,
  IonSelect,
  IonSelectOption,
  IonTitle,
  IonToolbar,
} from '@ionic/react';
import { logOutOutline } from 'ionicons/icons';

import { LanguageDataList } from '../../components/LanguageDataList';
import { RootContext } from '../../RootContext';

const { useSelector } = RootContext;

type HomeProps = {
  inputError: string;
  inputColor: string;
  loading: boolean;
  language: 'zh' | 'kr';
  text: string;
  send: (event: UserInterpretEvents) => void;
  handleLogout: () => void;
};

const Home: React.FC<HomeProps> = ({
  inputError,
  language,
  inputColor,
  text,
  loading,
  send,
  handleLogout,
}) => {
  const isNative = useSelector(({ context }) => context.platform !== 'web');

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Interpret {isNative ? '(native)' : '(web)'}</IonTitle>
          <IonButton color="danger" slot="end" onClick={handleLogout}>
            <IonIcon icon={logOutOutline} slot="start" />
          </IonButton>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <LanguageDataList />
        <IonGrid fixed={true}>
          <IonRow>
            <strong
              style={{
                fontSize: '1.5em',
                textAlign: 'center',
                width: '100%',
                marginTop: '4em',
              }}
            >
              Welcome to Polytlk. Please input chinese you want to understand.
            </strong>
          </IonRow>

          <>
            {inputError !== '' && (
              <IonRow>
                <p>{inputError}</p>
              </IonRow>
            )}
            <IonRow>
              <IonCol size="2">
                <IonItem>
                  <IonLabel>Language</IonLabel>
                  <IonSelect
                    value={language}
                    placeholder="Select One"
                    onIonChange={(e: { detail: { value: string } }) => {
                      if (e.detail.value === 'zh' || e.detail.value === 'kr') {
                        send({
                          type: 'UPDATE_LANGUAGE',
                          language: e.detail.value,
                        });
                      }
                    }}
                  >
                    <IonSelectOption value="zh">
                      <span role="img" aria-label="chinese flag">
                        🇨🇳
                      </span>
                    </IonSelectOption>
                    <IonSelectOption value="kr">
                      <span role="img" aria-label="korean flag">
                        🇰🇷
                      </span>
                    </IonSelectOption>
                  </IonSelect>
                </IonItem>
              </IonCol>
              <IonCol>
                <IonItem color={inputColor}>
                  <IonInput
                    value={text}
                    placeholder="Enter Text"
                    onIonChange={(e: { detail: { value: string } }) => {
                      send({
                        type: 'UPDATE_TEXT',
                        text: e.detail.value + '',
                      } as const);
                    }}
                    clearInput
                  />
                </IonItem>
              </IonCol>
              <IonCol size="1">
                <IonButton
                  onClick={() => {
                    send({ type: 'SUBMIT' });
                  }}
                >
                  Submit
                </IonButton>
              </IonCol>
            </IonRow>
            <IonLoading
              message={'Loading...'}
              isOpen={loading}
              backdropDismiss={true}
            />
          </>
        </IonGrid>
      </IonContent>
    </IonPage>
  );
};

export default Home;
