import type { FC } from 'react';

import {
  IonItem,
  IonItemDivider,
  IonItemGroup,
  IonItemOption,
  IonItemOptions,
  IonItemSliding,
  IonLabel,
  IonRow,
  IonText,
} from '@ionic/react';
import React, { useState } from 'react';

import { RootContext } from '../RootContext';

export type LanguageDataProps = {
  id: string;
};

const { useSelector } = RootContext;

export const LanguageData: FC<LanguageDataProps> = ({ id }) => {
  const results = useSelector(({ context }) => context.interpret.results);
  const { words, dialogue, meaning } = results[id]!;

  const sentence = words.reduce((sentence, [word]) => word + sentence, '');
  const [expanded, setExpanded] = useState(false);

  return expanded ? (
    <>
      <IonItemGroup>
        <IonItemDivider>
          <IonLabel>Words used in the text:</IonLabel>
        </IonItemDivider>
        {words.map(([word, phonetic, meaning], index) => (
          <IonItem key={index} className="ion-justify-content-evenly">
            <IonLabel className="ion-align-self-start">
              {word} ({phonetic})
            </IonLabel>
            <IonLabel className="ion-align-self-end ion-text-right ion-text-md-left">
              {meaning}
            </IonLabel>
          </IonItem>
        ))}
      </IonItemGroup>

      <IonItemGroup>
        <IonItemDivider>
          <IonLabel>Overall meaning of the text:</IonLabel>
        </IonItemDivider>
        <IonItem>
          <IonText>{meaning}</IonText>
        </IonItem>
      </IonItemGroup>

      <IonItemGroup>
        <IonItemDivider className="ion-justify-content-between">
          <IonLabel>Example dialogue:</IonLabel>
        </IonItemDivider>

        {dialogue.map(([dialogue, phonetic, translation], index) => (
          <IonItem key={index} className="">
            <IonLabel className="ion-text-nowrap">
              Person {index === 0 ? 'A' : 'B'}
              <IonRow>{dialogue}</IonRow>
              <IonRow>{phonetic}</IonRow>
              <IonRow>{translation}</IonRow>
            </IonLabel>
          </IonItem>
        ))}
      </IonItemGroup>
    </>
  ) : (
    <IonItemSliding>
      <IonItem>{sentence}</IonItem>
      <IonItemOptions>
        <IonItemOption
          color="primary"
          onClick={(e) => {
            setExpanded(!expanded);
          }}
        >
          Delete
        </IonItemOption>
      </IonItemOptions>
    </IonItemSliding>
  );
};
