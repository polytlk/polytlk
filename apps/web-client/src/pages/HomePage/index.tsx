/* eslint-disable @typescript-eslint/no-unsafe-argument */
import type { FC } from 'react';

import { createBrowserInspector } from '@statelyai/inspect';
import { useActorRef, useSelector } from '@xstate/react';
import { machine } from 'interpret-machine';
import { useContext } from 'react';

import ConfigContext from '../../ConfigContext';
import { RootContext } from '../../RootContext';
import Home from './Home';

const { inspect } = createBrowserInspector();

const HomeContainer: FC = () => {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const config = useContext(ConfigContext)!;
  const token = RootContext.useSelector(({ context }) => context.token);
  const rootRef = RootContext.useActorRef();

  const handleLogout = () => {
    rootRef.send({ type: 'LOGOUT' });
  };

  const interpretRef = useActorRef(machine, {
    inspect,
    input: { baseUrl: config.baseUrl, token },
  });

  const inputError = useSelector(
    interpretRef,
    ({ context }) => context.inputError
  );

  const inputColor = useSelector(
    interpretRef,
    ({ context }) => context.inputColor
  );

  const language = useSelector(interpretRef, ({ context }) => context.language);
  const loading = useSelector(interpretRef, ({ context }) => context.loading);
  const text = useSelector(interpretRef, ({ context }) => context.text);
  const data = useSelector(interpretRef, ({ context }) => {
    const { results } = context;
    let key: keyof typeof results;
    const d = [];

    for (key in results) {
      const result = results[key];
      if (result !== undefined) {
        d.push(result);
      }
    }

    return d;
  });

  return (
    <Home
      data={data}
      inputError={inputError}
      inputColor={inputColor}
      language={language}
      loading={loading}
      text={text}
      send={interpretRef.send}
      handleLogout={handleLogout}
    />
  );
};

export default HomeContainer;
