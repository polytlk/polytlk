import type { LanguageDataProps } from './LanguageData';

import { IonCol, IonImg } from '@ionic/react';
import { type FC } from 'react';
import React from 'react';
import { Virtuoso } from 'react-virtuoso';

import { LanguageData } from './LanguageData';

export const LanguageDataList: FC<{ data: LanguageDataProps[] }> = ({
  data,
}) => {
  return data.length > 0 ? (
    <Virtuoso
      style={{ height: '50%' }}
      data={data}
      itemContent={(index, { words, dialogue, meaning }) => (
        <LanguageData words={words} dialogue={dialogue} meaning={meaning} />
      )}
    />
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
  );
};
