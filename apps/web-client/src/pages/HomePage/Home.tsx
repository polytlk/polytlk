import {
  IonButton,
  IonCol,
  IonContent,
  IonGrid,
  IonHeader,
  IonImg,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  IonListHeader,
  IonLoading,
  IonMenuButton,
  IonPage,
  IonRow,
  IonSelect,
  IonSelectOption,
  IonText,
  IonTitle,
  IonToolbar,
} from '@ionic/react';

export type LanguageData = {
  words: [string, string, string][];
  meaning: string;
  dialogue: [string, string, string][];
};

type HomeProps = {
  data: LanguageData | null;
  inputError: string;
  inputColor: string;
  loading: boolean;
  language: 'zh' | 'kr';
  text: string;
  send: any;
};

const Home: React.FC<HomeProps> = ({
  data,
  inputError,
  language,
  inputColor,
  text,
  loading,
  send,
}) => {
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
          <IonRow className="ion-align-items-center" style={{ margin: '2em' }}>
            {data !== null ? (
              <IonList>
                <IonListHeader>Words used in the text:</IonListHeader>
                {data.words.map(([word, phonetic, meaning], index) => (
                  <IonItem key={index}>
                    <IonLabel>
                      - {word} ({phonetic}) - {meaning}
                    </IonLabel>
                  </IonItem>
                ))}
                <IonListHeader>Overall meaning of the text:</IonListHeader>
                <IonItem>
                  <IonText>{data.meaning}</IonText>
                </IonItem>
                <IonListHeader>Example dialogue:</IonListHeader>
                {data.dialogue.map(
                  ([dialogue, phonetic, translation], index) => (
                    <IonItem key={index}>
                      <IonLabel>
                        Person {index === 0 ? 'A' : 'B'}: {dialogue} ({phonetic}
                        ) | "{translation}"
                      </IonLabel>
                    </IonItem>
                  )
                )}
              </IonList>
            ) : (
              <>
                <IonCol size="3"></IonCol>
                <IonCol size="6" className="ion-padding-top ion-padding-bottom">
                  <IonImg
                    src="https://source.unsplash.com/random/800x600"
                    alt="Your Description"
                    style={{
                      width: '100%',
                      height: '200px',
                      objectFit: 'cover',
                      margin: 'auto',
                    }}
                  />
                </IonCol>
                <IonCol size="3"></IonCol>
              </>
            )}
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
                    onIonChange={(e) => {
                      send({
                        type: 'UPDATE_LANGUAGE',
                        language: e.detail.value + '',
                      });
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
                    onIonChange={(e) => {
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
                    send('SUBMIT');
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
