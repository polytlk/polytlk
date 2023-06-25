import React, { useState, useEffect } from 'react';
import { IonInput, IonItem, IonLabel, IonSelect, IonSelectOption, IonButton, IonLoading } from '@ionic/react';


const START_TASK_ENDPOINT = 'http://localhost:7079/chinese';
const getTaskStreamEndpoint = (taskId: string) => `http://localhost:7079/task/${taskId}/stream`

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
    const [taskId, setTaskId] = useState(null);
    const [taskResult, setTaskResult] = useState(null);
    const [loading, setLoading] = useState<boolean>(false);

    const handleSubmit = async () => {
        if (language === "zh") {
            try {
                const response = await fetch(START_TASK_ENDPOINT, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ 'user_input': text })
                });

                const { task_id } = await response.json();

                if (task_id) {
                    setTaskId(task_id)
                    setLoading(true);
                }

            } catch (error) {
                console.error('Error:', error);
            }
        }
    };

    useEffect(() => {
        if (taskId) {
          const eventSource = new EventSource(getTaskStreamEndpoint(taskId));
    
          eventSource.onmessage = (event) => {
            setTaskResult(event.data);
            setLoading(false);
            eventSource.close();
          };
    
          return () => {
            eventSource.close();
          };
        }
      }, [taskId]);
    

    return (
        <div>
            {taskResult && <p>Task result: {taskResult}</p>}
            <LanguageSelector language={language} onLanguageChange={setLanguage} />
            <IonItem>
                <IonInput value={text} placeholder="Enter Text" onIonChange={e => setText(e.detail.value + '')} clearInput />
            </IonItem>
            <IonButton onClick={handleSubmit}>Start Task</IonButton>
            <IonLoading message={'Loading...'} isOpen={loading}/>
        </div>
    );
};

export default InterpretBar;
