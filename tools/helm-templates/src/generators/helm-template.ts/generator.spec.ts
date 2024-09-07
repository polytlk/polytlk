import { readProjectConfiguration, Tree } from '@nx/devkit';
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';

import { helmTemplateGenerator } from './generator';
import { HelmTemplateGeneratorSchema } from './schema';

describe('helm-template generator', () => {
  let tree: Tree;
  const options: HelmTemplateGeneratorSchema = { name: 'test' };

  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace();
  });

  it('should run successfully', async () => {
    await helmTemplateGenerator(tree, options);
    const config = readProjectConfiguration(tree, 'test');
    expect(config).toBeDefined();
  });
});
