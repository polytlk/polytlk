/* eslint-disable @typescript-eslint/no-unsafe-argument */
import type { FC } from 'react';
import type { LanguageData } from './Home';

import { useMachine } from '@xstate/react';
import { machine } from 'interpret-machine';
import { useContext, useEffect, useState } from 'react';

import { AuthContext } from '../../AuthContext';
import ConfigContext from '../../ConfigContext';
import Home from './Home';

const HomeContainer: FC = () => {
  const [taskResult, setTaskResult] = useState<string>('');
  const [data, setData] = useState<LanguageData | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const config = useContext(ConfigContext)!;
  const token = AuthContext.useSelector(({ context }) => context.token);

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
    input: { baseUrl: config.baseUrl, token },
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
        send({ type: 'NEW_TASK' });
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
