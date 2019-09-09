[![npm version](https://badge.fury.io/js/ember-unused-components.svg)](https://badge.fury.io/js/ember-unused-components)
[![Build Status](https://travis-ci.org/vastec/ember-unused-components.svg?branch=master)](https://travis-ci.org/vastec/ember-unused-components)

ember-unused-components
==============================================================================

This script searches for unused components in your Ember project. It supports:
 - classic structure,
 - POD structure,
 - Module Unification structure,
 - `{{curly-braces}}` syntax,
 - `<AngleBrackets>` syntax (also nested ones like `<Angle::MyBrackets>`),
 - `ember-light-table`'s way of defining `cellComponent: 'component-name'` and `component: 'component-name'`
 - `(component "component-name")` helper used in templates
 - ignoring files,
 - and whitelisting components unused temporary.
 
It also has a very interesting statistics module.

Installation
------------------------------------------------------------------------------

```bash
$ yarn add -D ember-unused-components
```

or

```bash
$ npm install ember-unused-components --save-dev
```

Usage
------------------------------------------------------------------------------

Run in your app root directory:

```bash
$ ./node_modules/.bin/ember-unused-components
```

or

```bash
$ npx ember-unused-components
```

Expected output (simplified):

```bash

 No. of components: 277
 No. of unused components: 2 (7.22%)

 Unused components:
  - app/app-tab-panel
  - user/user-birthday
```

If you feel like there are too many components listed then check [Configuration Section](#configuration).

#### Stats

Make sure to try optional parameter `--stats` so you'll see some interesting stuff:

```bash
$ npx ember-unused-components --stats

 No. of components: 304
 No. of unused components: 8 (2.63%)

 Unused components:
  - report-header
  - report-row-title
  - reports-settings-dropdown
  - ui-checkbox-list
  - ui-manage-screen-title
  - ui-phone/-body/-message
  - ui-table/-cell-currency
  - ui-table/-cell-date

 The most used component: ui-form-button (101 occurrences)
 The number of components used just once: 171 (56.25%)
 Usage of {{curly-braces}} vs <AngleBrackets> syntax: 509 (56.81%) vs 387 (43.19%)
 Usage of (component "component-name") helper in templates: 70
 Usage in JS files (e.g. through `import` or ELT): 63
```

#### Occurrences

You can also print all occurrences of components that were found. Use `--occurrences` or `--o`:

```bash
$ npx ember-unused-components --occurrences

// simplified

user-avatar:

   > ./app/templates/components/user-card.hbs
    - <UserAvatar @src={{_imageSource}} />

welcome-page:

   > ./app/templates/application.hbs
    - {{welcome-page}}
```

### Advanced usage

Typically the script should realize if you are using [POD structure](https://ember-cli.com/user-guide/#pod-structure) or not and find its way to components directory.

If you have problems with that, consider:

#### Forcing POD

To force using POD use `--pods` argument (alias: `-p`). Like this:

```bash
$ npx ember-unused-components --pods
```

The script will use the default directory of POD components: `app/components`. **Please let me know** if you had to force using POD. I made a simple guessing algorithm that should handle PODs out-of-the-box. 

#### Forcing POD with the custom directory

Your app should be configured to have `podModulePrefix` property in `config/environment.js` if you are using POD but if it somehow doesn't work you can specify it through `--pods-dir` (alias: `-pd`). Like this:

```bash
$ npx ember-unused-components --pods --pods-dir="modules/components-repository"
```

Configuration
------------------------------------------------------------------------------

In typical use cases, it should work out of the box and you don't have to configure anything but you can consider the following options.
First, you need to create `.eucrc.js` file in the root directory:

```js
module.exports = {
  whitelist: [
    'app/app-tab-panel' // we will use it again soon
  ],
  ignore: [
    'app/templates/freestyle.hbs' // this is our template with style guides
  ],
  failOnUnused: false // optional, default is false, should we throw errors when we find unused components (useful in CI)
};
```

### Whitelist

You can specify which components should not be treated as unused even if the script couldn't find their usage occurrences. This happens when:
 - you know that the component will be used in the future and you don't want to remove it and being reminded of that
 - you use some kind of "dynamic name resolution" for your components

------------------------------------------------------------------------------

For the "dynamic name resolution" scenario consider following example.
Typical dynamic component look like this:

**Template**
```hbs
{{component name car=car}}
```

**JavaScript**
```js
name: computed('car.type', function () {
  return `car-card-${this.get('car.type')}`;
});
```

**Result**

Which may result in having following components in use:
- car.type = 'suv' => `{{car-card-suv car=car}}`
- car.type = 'sport' => `{{car-card-sport car=car}}`
- car.type = 'sedan' =>  `{{car-card-sedan car=car}}`

Unfortunately, this static analysis tool doesn't understand it yet and doesn't know that your component `car-card-suv`
has been used anywhere.
You can whitelist these components from being marked as unused by referencing to them directly:
```js
module.exports = {
  whitelist: [
    'car-card-suv',
    'car-card-sport',
    'car-card-sedan'
  ]
};
```
or by using wildcard:
```js
module.exports = {
  whitelist: ['car-card-*']
};
```

### Ignored files

A component might be used in some files like guidelines template (see [ember-freestyle](https://github.com/chrislopresto/ember-freestyle)) that in fact does not indicate that it is in use. The best practice is to ignore that file:

```js
module.exports = {
  ignore: [
    'app/templates/freestyle.hbs' // this is our template with style guides
  ]
};
```

### Fail on unused

You might want to throw errors when unused components are found. This is especially useful when running in CI.  This behavior is turned off by default.

Turn this behavior on in 2 ways:

Setting the `failOnUnused` property of your `.eucrc.js` file to `true`.

```js
module.exports = {
  failOnUnused: true
};

// In practice, it might look something like this:

module.exports = {
  failOnUnused: process.env.CI // many CI services like Travis-ci and Circle-ci inject a CI env variable by default.
};
```

Passing the `--fail-on-unused` flag to the cli:

```bash
./node_modules/.bin/ember-unused-components --fail-on-unused
```

The `.eucrc.js` configuration file takes precedence over the cli argument.

Removing components
------------------------------------------------------------------------------

Auto removing components might be useful but it's not yet supported. Please consider that simple removal of:
 - `template.hbs` or `templates/component-name.hbs`
 - `component.js` or `components/component-name.js`
 - `style.css` or `styles/components/style.css`

might not remove everything you would like. Examples:

 - global CSS classes that are no longer used
 - 3rd party JS libraries used only in that component
 - translation keys that are no longer needed
 - assets (images) that are no longer used
 - local overwrites/adjustments for that component made by parent's CSS

So you'll still have some dead code because of unused components.

I encourage you to remove components from the list manually.

Best Practices
------------------------------------------------------------------------------

Once you delete unused components run the script once again :) You might find that now some other components are no longer used.
This happens when the component is used in the unused component.

Example:


```hbs
{{!-- users-list component --}}
{{#each users as |user|}}
  {{user-card user=user}}
{{/each}}
```

So `user-card` is being used but in *unused* component `users-list`. Once you will delete `users-list` component then `user-card`
will not be longer used.

Contributing
------------------------------------------------------------------------------

If you feel like you need some functionality please raise an issue or event better Contribute!

### Testing

It's very important to prepare test cases for fixes and new features.

We have a directory `test-apps` with applications that have different configs and different Ember versions which support or
does not support certain "features" like angle brackets components or module unification project structure.

### Running tests

* `yarn run test`

### Linting

* `yarn run lint`

### Debugging

* `npx ember-unused-components --debug`

License
------------------------------------------------------------------------------

This project is licensed under the [MIT License](LICENSE.md).
