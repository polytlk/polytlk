/* eslint-disable @typescript-eslint/no-unsafe-argument */
import type { FC } from 'react';

//import type { LanguageData } from './Home';
import { createBrowserInspector } from '@statelyai/inspect';
import { useActorRef, useSelector } from '@xstate/react';
import { machine } from 'interpret-machine';
import { useContext } from 'react';
import { useHistory } from 'react-router-dom';

import { AuthContext } from '../../AuthContext';
import ConfigContext from '../../ConfigContext';
import Home from './Home';

const { inspect } = createBrowserInspector();

const HomeContainer: FC = () => {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const config = useContext(ConfigContext)!;
  const token = AuthContext.useSelector(({ context }) => context.token);
  const authRef = AuthContext.useActorRef();
  const history = useHistory();

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

  interpretRef.subscribe(({ context }) => {
    if (context.inputError === 'Access to this API has been disallowed') {
      authRef.send({ type: 'LOGOUT' });
      history.push('/login');
    }
  });

  //const data = { words: [], meaning: '', dialogue: [] };

  return (
    <Home
      data={null}
      inputError={inputError}
      inputColor={inputColor}
      language={language}
      loading={loading}
      text={text}
      send={interpretRef.send}
    />
  );
};

export default HomeContainer;
