const express = require('express');

const { useMiddlewares } = require('./middleware.cjs');

const PORT = 4200;

const app = new express();
// eslint-disable-next-line react-hooks/rules-of-hooks
useMiddlewares(app);

app.listen(PORT, () => {
  console.log(`Listening on http://localhost:${PORT}`);
});
