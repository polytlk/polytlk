/* eslint-disable @typescript-eslint/no-unsafe-argument */
import type { FC } from 'react';

import { RootContext } from '../../RootContext';
import Home from './Home';

const { useActorRef, useSelector } = RootContext;

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
  const data = useSelector(({ context }) => {
    const { results } = context.interpret;
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
      send={rootRef.send}
      handleLogout={handleLogout}
    />
  );
};

export default HomeContainer;
