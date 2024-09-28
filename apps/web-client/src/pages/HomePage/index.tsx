/* eslint-disable @typescript-eslint/no-unsafe-argument */
import type { FC } from 'react';

import { useActorRef, useSelector } from '#rootmachine/index';

import Home from './Home';

const HomeContainer: FC = () => {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const rootRef = useActorRef();

  const handleLogout = () => {
    rootRef.send({ type: 'LOGOUT' });
  };

  const language = useSelector(({ context }) => context.interpret.language);
  const loading = useSelector(({ context }) => context.interpret.loading);
  const inputColor = useSelector(({ context }) => context.interpret.inputColor);
  const inputError = useSelector(({ context }) => context.interpret.inputError);
  const text = useSelector(({ context }) => context.interpret.text);

  return (
    <Home
      inputError={inputError}
      inputColor={inputColor}
      language={language}
      loading={loading}
      text={text}
      send={rootRef.send}
      handleLogout={handleLogout}
    />
  );
};

export default HomeContainer;
