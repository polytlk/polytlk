import {
  IonItem,
  IonLabel,
  IonList,
  IonListHeader,
  IonText,
} from '@ionic/react';
import React from 'react';

interface LanguageDataProps {
  data: {
    words: Array<[string, string, string]>;
    meaning: string;
    dialogue: Array<[string, string, string]>;
  };
}

const LanguageDataComponent: React.FC<LanguageDataProps> = (props) => {
  const { data } = props;
  return (
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
      {data.dialogue.map(([dialogue, phonetic, translation], index) => (
        <IonItem key={index}>
          <IonLabel>
            Person {index === 0 ? 'A' : 'B'}: {dialogue} ({phonetic}) | "
            {translation}"
          </IonLabel>
        </IonItem>
      ))}
    </IonList>
  );
};

export default LanguageDataComponent;
