/* eslint-disable @typescript-eslint/no-unsafe-argument */
import type { FC } from 'react';
import type { LanguageData } from './Home';

import { CapacitorHttp } from '@capacitor/core';
import { useMachine } from '@xstate/react';
import { SecureStoragePlugin } from 'capacitor-secure-storage-plugin';
import { machine } from 'interpret-machine';
import { useContext, useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { assign } from 'xstate';

import AuthContext, { KEY } from '../../AuthContext';
import ConfigContext from '../../ConfigContext';
import Home from './Home';

const HomeContainer: FC = () => {
  const [taskResult, setTaskResult] = useState<string>('');
  const [data, setData] = useState<LanguageData | null>(null);
  const { token } = useContext(AuthContext);
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const config = useContext(ConfigContext)!;
  const history = useHistory();

  useEffect(() => {
    try {
      if (taskResult !== '') {
        const parsedData = JSON.parse(taskResult);
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        setData(parsedData);
      } else {
        setData(null);
      }
    } catch (error: unknown) {
      console.error('Failed to parse taskResult:', error);
    }
  }, [taskResult]);

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
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        setTaskResult(result);
        send('NEW_TASK');
        eventSource.close();
      };

      return () => {
        eventSource.close();
      };
    }
  }, [state.context.taskId, setTaskResult, config.baseUrl, send, token]);

  return (
    <Home
      data={data}
      inputError={state.context.inputError}
      inputColor={state.context.inputColor}
      language={state.context.language}
      loading={state.context.loading}
      text={state.context.text}
      send={send}
    />
  );
};

export default HomeContainer;
