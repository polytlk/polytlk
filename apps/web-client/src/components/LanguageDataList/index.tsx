import { useSelector } from '#rootmachine/index';
import React from 'react';
import { Virtuoso } from 'react-virtuoso';

import { IonCol, IonImg } from '@ionic/react';

import { LanguageData } from '../LanguageData';

export const LanguageDataList = () => {
  const resultIds = useSelector(({ context }) => context.interpret.taskIds);

  return resultIds.length > 0 ? (
    <Virtuoso
      style={{ height: '50%' }}
      data={resultIds}
      itemContent={(_, id) => <LanguageData key={id} id={id} />}
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
