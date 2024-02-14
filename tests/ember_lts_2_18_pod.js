import test from 'ava';

const analyser = require('../lib/analyser');
const utils = require('../lib/utils');

test('2.18 LTS POD - get config', t => {
  let expectedConfig = {
    sourcePaths: ['/test-apps/ember_lts_2_18_pod/app'],
    projectRoot: '/test-apps/ember_lts_2_18_pod/',
    ignore: ['app/templates/freestyle.hbs'],
    includeAddons: false,
    isAddon: false,
    allowlist: ['z-button'],
    componentPaths: ['/test-apps/ember_lts_2_18_pod/app/modules/components'],
    failOnUnused: false,
  };
  let commandOptions = { path: '/test-apps/ember_lts_2_18_pod/' };
  let result = utils.getConfig(commandOptions);

  t.deepEqual(result, expectedConfig, 'has proper config');
});

test('2.18 LTS POD - map components', t => {
  let config = {
    sourcePaths: ['/test-apps/ember_lts_2_18_pod/app'],
    projectRoot: '/test-apps/ember_lts_2_18_pod/',
    ignore: ['app/templates/freestyle.hbs'],
    allowlist: ['z-button'],
    componentPaths: ['/test-apps/ember_lts_2_18_pod/app/modules/components'],
  };

  let expectedComponents = [
    'user/user-avatar',
    'user/user-card',
    'user/user-info',
    'user/user-signature',
    'user/user-something',
    'x-button',
    'y-button',
    'z-button',
  ];

  let expectedUnusedComponents = [
    'user/user-avatar',
    'user/user-card',
    'user/user-info',
    'user/user-signature',
    'user/user-something',
    'x-button',
    'y-button',
    'z-button',
  ];

  analyser.mapComponents(config);

  t.deepEqual(
    Object.values(analyser.components).map(c => c.key),
    expectedComponents,
    'has proper list of components'
  );
  t.deepEqual(
    Object.values(analyser.components)
      .filter(c => c.stats.count == 0 && !c.allowlisted)
      .map(c => c.key),
    expectedUnusedComponents,
    'has proper list of unused components at this stage'
  );
});

test('2.18 LTS POD - look for unused components and calculate stats', t => {
  let config = {
    sourcePaths: ['/test-apps/ember_lts_2_18_pod/app'],
    projectRoot: '/test-apps/ember_lts_2_18_pod/',
    ignore: ['app/templates/freestyle.hbs'],
    allowlist: ['z-button'],
    componentPaths: ['/test-apps/ember_lts_2_18_pod/app/modules/components'],
  };

  let expectedComponents = [
    'user/user-avatar',
    'user/user-card',
    'user/user-info',
    'user/user-signature',
    'user/user-something',
    'x-button',
    'y-button',
    'z-button',
  ];

  let expectedUnusedComponents = ['user/user-signature'];

  let expectedStats = {
    'user/user-avatar': {
      count: 1,
      curly: 1,
      angle: 0,
      js: 0,
      componentHelper: 0,
    },
    'user/user-card': {
      count: 1,
      curly: 1,
      angle: 0,
      js: 0,
      componentHelper: 0,
    },
    'user/user-info': {
      count: 1,
      curly: 1,
      angle: 0,
      js: 0,
      componentHelper: 0,
    },
    'user/user-signature': {
      count: 0,
      curly: 0,
      angle: 0,
      js: 0,
      componentHelper: 0,
    },
    'user/user-something': {
      count: 6,
      curly: 0,
      angle: 0,
      js: 6,
      componentHelper: 0,
    },
    'x-button': { count: 2, curly: 0, angle: 0, js: 1, componentHelper: 1 },
    'y-button': { count: 7, curly: 1, angle: 0, js: 6, componentHelper: 0 },
    'z-button': { count: 0, curly: 0, angle: 0, js: 0, componentHelper: 0 },
  };

  analyser.scanProject(config);
  analyser.respectAllowlist(config.allowlist);

  t.deepEqual(
    Object.values(analyser.components).map(c => c.key),
    expectedComponents,
    'has proper list of components'
  );
  t.deepEqual(
    Object.values(analyser.components)
      .filter(c => c.stats.count == 0 && !c.allowlisted)
      .map(c => c.key),
    expectedUnusedComponents,
    'has proper list of unused components'
  );
  Object.keys(expectedStats).forEach(componentKey => {
    t.deepEqual(
      analyser.components[componentKey].stats,
      expectedStats[componentKey],
      `has properly calculated stats for ${componentKey}`
    );
  });
});
