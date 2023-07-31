import {
  IonItem,
  IonLabel,
  IonList,
  IonListHeader,
  IonText,
} from '@ionic/react';
import React from 'react';

export type LanguageDataProps = {
  words: [string, string, string][];
  meaning: string;
  dialogue: [string, string, string][];
};

export const LanguageDataComponent: React.FC<LanguageDataProps> = ({
  words,
  meaning,
  dialogue,
}) => {
  return (
    <IonList>
      <IonListHeader>Words used in the text:</IonListHeader>
      {words.map(([word, phonetic, meaning], index) => (
        <IonItem key={index}>
          <IonLabel>
            - {word} ({phonetic}) - {meaning}
          </IonLabel>
        </IonItem>
      ))}
      <IonListHeader>Overall meaning of the text:</IonListHeader>
      <IonItem>
        <IonText>{meaning}</IonText>
      </IonItem>
      <IonListHeader>Example dialogue:</IonListHeader>
      {dialogue.map(([dialogue, phonetic, translation], index) => (
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
