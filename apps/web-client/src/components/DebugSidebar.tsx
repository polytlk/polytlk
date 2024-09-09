import type { FC } from 'react';

import {
  IonContent,
  IonHeader,
  IonMenu,
  IonTitle,
  IonToolbar,
} from '@ionic/react';
import { useContext, useEffect, useRef } from 'react';

import { IframeContext } from '../context';

const DebugSidebar: FC = () => {
  const iframeRef = useContext(IframeContext);
  const containerRef = useRef<HTMLIonContentElement>(null);

  useEffect(() => {
    if (
      containerRef.current != null &&
      iframeRef != null &&
      iframeRef.current != null
    ) {
      containerRef.current.appendChild(iframeRef.current);
      iframeRef.current.style.display = 'block';
      iframeRef.current.style.width = '100%';
      iframeRef.current.style.height = '100%';
    }
  }, [containerRef, iframeRef]);

  return (
    <IonMenu side="end" contentId="debug" style={{ '--min-width': '50%' }}>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Debug Sidebar</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent ref={containerRef} style={{ display: 'flex' }}></IonContent>
    </IonMenu>
  );
};

export default DebugSidebar;
