import {
  addProjectConfiguration,
  formatFiles,
  generateFiles,
  Tree,
} from '@nx/devkit';
import * as path from 'path';

import { HelmTemplateGeneratorSchema } from './schema';

const generateTargets = ({ name, type }: HelmTemplateGeneratorSchema) => {
  if (type == 'addon') {
    return {
      template: {
        executor: 'nx:run-commands',
        options: {
          command: `./tools/scripts/template_addons.sh ${name}`,
        },
      },
      'template:dev': {
        executor: 'nx:run-commands',
        options: {
          command: `./tools/scripts/template_addons.sh ${name} development`,
        },
      },
    };
  }

  const isApi = type == 'api';

  return {
    template: {
      executor: 'nx:run-commands',
      options: {
        command: `./tools/scripts/template_apps.sh ${name} ${isApi}`,
      },
    },
    'template:dev': {
      executor: 'nx:run-commands',
      options: {
        command: `./tools/scripts/template_apps.sh ${name} ${isApi} development`,
      },
    },
  };
};

export async function helmTemplateGenerator(
  tree: Tree,
  options: HelmTemplateGeneratorSchema
) {
  const { name, type } = options;
  const targets = generateTargets(options);

  const isAddon = type == 'addon';
  const projectRoot = `libs/helm/${isAddon ? type : 'app'}s/${name}`;

  addProjectConfiguration(tree, isAddon ? name : `${name}-chart`, {
    root: projectRoot,
    projectType: 'library',
    sourceRoot: `${projectRoot}/src`,
    targets,
  });
  generateFiles(tree, path.join(__dirname, 'files'), projectRoot, options);
  await formatFiles(tree);
}

export default helmTemplateGenerator;
