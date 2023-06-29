import React, { useEffect, useRef } from "react";
import { IonMenu, IonHeader, IonToolbar, IonTitle, IonContent } from '@ionic/react';

import { IframeContext } from '../context'

const DebugSidebar: React.FC<{}> = () => {
    const iframeRef = React.useContext(IframeContext);
    const containerRef = useRef<HTMLIonContentElement>(null);

    useEffect(() => {
        if (containerRef.current && iframeRef && iframeRef.current) {
            containerRef.current.appendChild(iframeRef.current);
            iframeRef.current.style.display = "block";
            iframeRef.current.style.width = "100%";
            iframeRef.current.style.height = "100%";
        }
    }, [containerRef, iframeRef]);

    return (
        <IonMenu side="end" contentId="main" style={{ '--min-width': '50%' }}>
            <IonHeader>
                <IonToolbar>
                    <IonTitle>Debug Sidebar</IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent ref={containerRef} style={{ display: 'flex' }}>

            </IonContent>
        </IonMenu>
    );
};

export default DebugSidebar;