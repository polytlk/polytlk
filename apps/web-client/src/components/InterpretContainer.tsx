/* eslint-disable @typescript-eslint/no-unsafe-argument */
import type { FC } from 'react';

import { CapacitorHttp } from '@capacitor/core';
import {
  IonButton,
  IonCol,
  IonInput,
  IonItem,
  IonLabel,
  IonLoading,
  IonRow,
  IonSelect,
  IonSelectOption,
} from '@ionic/react';
import { useMachine } from '@xstate/react';
import { SecureStoragePlugin } from 'capacitor-secure-storage-plugin';
import { useContext, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { assign } from 'xstate';

import AuthContext, { KEY } from '../AuthContext';
import ConfigContext from '../ConfigContext';
import { machine } from './machine';

const LanguageSelector: FC<{
  language: string;
  onLanguageChange: (language: string) => void;
}> = ({ language, onLanguageChange }) => (
  <IonItem>
    <IonLabel>Language</IonLabel>
    <IonSelect
      value={language}
      placeholder="Select One"
      onIonChange={(e) => onLanguageChange(e.detail.value + '')}
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
);

const InterpretBar: FC<{
  onTaskResult: (res: string) => void;
}> = ({ onTaskResult }) => {
  const { token } = useContext(AuthContext);
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const config = useContext(ConfigContext)!;
  const history = useHistory();

  const [state, send] = useMachine(machine, {
    devTools: true,
    guards: {
      isChinese: (context) => context.language === 'zh',
    },
    actions: {
      setLoading: assign({ loading: true }),
      clearError: assign({ inputError: '', inputColor: 'light' }),
      setTaskId: assign((_, event) => {
        if (event.type !== 'TASK_RECEIVED') return {};
        return {
          taskId: event.taskId,
        };
      }),
      setError: assign({
        inputError: 'Please enter valid Chinese',
        inputColor: 'danger',
      }),
      resetLoading: assign({ loading: false }),
    },
    services: {
      submitChinese: (context) => async () => {
        const response = await CapacitorHttp.post({
          url: `${config.baseUrl}/api/chinese/interpretation`,
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          data: { user_input: context.text },
        });

        if (response.status !== 401) {
          send({ type: 'TASK_RECEIVED', taskId: response.data.task_id });
        } else {
          await SecureStoragePlugin.remove({ key: KEY });
          history.push('/login');
        }
      },
    },
  });

  useEffect(() => {
    if (state.context.taskId !== '') {
      const eventSource = new EventSource(
        `${config.baseUrl}/api/chinese/task/${state.context.taskId}/stream?key=${token}`
      );

      eventSource.onmessage = (event) => {
        // TODO: add zod schema here
        // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
        const result = event.data
          ? JSON.parse(event.data).ari_data
          : 'ari could not be generated :(';
        onTaskResult(result);
        send('NEW_TASK');
        eventSource.close();
      };

      return () => {
        eventSource.close();
      };
    }
  }, [state.context.taskId, onTaskResult, config.baseUrl, send, token]);

  const handleSubmit = () => {
    send('SUBMIT');
  };

  return (
    <>
      {state.context.inputError !== '' && (
        <IonRow>
          <p>{state.context.inputError}</p>
        </IonRow>
      )}
      <IonRow>
        <IonCol size="2">
          <LanguageSelector
            language={state.context.language}
            onLanguageChange={(language) =>
              send({ type: 'UPDATE_LANGUAGE', language })
            }
          />
        </IonCol>
        <IonCol>
          <IonItem color={state.context.inputColor}>
            <IonInput
              value={state.context.text}
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
          <IonButton onClick={handleSubmit}>Submit</IonButton>
        </IonCol>
      </IonRow>
      <IonLoading
        message={'Loading...'}
        isOpen={state.context.loading}
        backdropDismiss={true}
      />
    </>
  );
};

export default InterpretBar;
