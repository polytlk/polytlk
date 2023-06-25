import React, { useState } from 'react';
import { IonInput, IonItem, IonLabel, IonSelect, IonSelectOption } from '@ionic/react';

const LanguageSelector: React.FC<{ language: string; onLanguageChange: (language: string) => void }> = ({ language, onLanguageChange }) => (
  <IonItem>
    <IonLabel>Language</IonLabel>
    <IonSelect value={language} placeholder="Select One" onIonChange={e => onLanguageChange(e.detail.value)}>
      <IonSelectOption value="zh">Chinese</IonSelectOption>
      <IonSelectOption value="kr">Korean</IonSelectOption>
    </IonSelect>
  </IonItem>
);

const InterpretBar: React.FC = () => {
  const [language, setLanguage] = useState<string>('zh');
  const [text, setText] = useState<string>('');

  return (
    <div>
      <LanguageSelector language={language} onLanguageChange={setLanguage} />
      <IonItem>
        <IonInput value={text} placeholder="Enter Text" onIonChange={e => setText(e.detail.value + '')} clearInput/>
      </IonItem>
    </div>
  );
};

export default InterpretBar;