import fs from 'fs/promises';
import yaml from 'js-yaml';

import parser from '@apidevtools/json-schema-ref-parser';

import { download, runCommand } from './utils.js';

const { NX_WORKSPACE_ROOT, NX_TASK_TARGET_PROJECT } = process.env;

const apiRoot = `${NX_WORKSPACE_ROOT}/apps/${NX_TASK_TARGET_PROJECT}/src/utils/allauth`;
const getUrl = (file) =>
  `https://docs.allauth.org/en/dev/headless/openapi-specification/${file}`;

const yamlUrl = getUrl('openapi.yaml');

try {
  // if you want to avoid modifying the original schema, you can disable the `mutateInputSchema` option
  const y = await download(yamlUrl);

  // Replace the matching part with an empty string
  const modifiedContent = yaml.load(y);
  modifiedContent.info.description = '';

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  await fs.writeFile(
    `${apiRoot}/openapi.yaml`,
    yaml.dump(modifiedContent),
    () => {
      console.log('wrote the yaml file');
    }
  );

  let schema = await parser.bundle(`${apiRoot}/openapi.yaml`, {
    mutateInputSchema: false,
  });

  await fs.writeFile(
    `${apiRoot}/openapi.json`,
    JSON.stringify(schema, null, 2),
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    () => {}
  );
  //await runCommand('pnpx orval --project allauth');
  await runCommand('pnpx orval --project allauthZod');
  await runCommand(`rm ${apiRoot}/openapi.yaml`);
  await runCommand(`rm ${apiRoot}/openapi.json`);
} catch (err) {
  console.error(err);
}
