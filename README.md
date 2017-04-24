# preact-small-redux

Preact bindings for Small-Redux.

Simple and compact bindings to use [preact](https://github.com/developit/preact)
with [small-redux](https://github.com/m18ru/small-redux).

This bindings is not simular to classic `react-redux` API. If you want to use
similar implementation, you can use
[preact-small-redux-classic](https://github.com/m18ru/preact-small-redux-classic)
package.

Written in TypeScript, types are also included.

## Installation

For bundlers and other NPM-based environments:

```
npm install --save-dev preact small-redux tslib preact-small-redux
```

Package `tslib` required in ES5-ESM version for `__extends` helper function.
It's not required for ES2015 version and for UMD version (function is included
in UMD).

## Usage

### UMD

UMD is default for this package, so just use something like:

```js
import {createStore} from 'small-redux';
import createSubscribedComponent from 'preact-small-redux';
// or
const {createStore} = require( 'small-redux' );
const createSubscribedComponent = require( 'preact-small-redux' );

const store = createStore( reducer );
const SubscribedComponent = createSubscribedComponent( store );

class MyComponent extends SubscribedComponent
{
	// …
}
```

For using directly in browser (import with `<script>` tag in HTML-file):

* [Development version](https://unpkg.com/preact-small-redux/es5/index.js)
* [Production version](https://unpkg.com/preact-small-redux/es5/preact-small-redux.min.js)

You can use AMD or `PreactSmallRedux` global variable.

### ES2015 module systems (ES5-ESM)

Package contain `module` property for use with ES2015 module bundlers
(like Rollup and Webpack 2).

### ES2015 code base

If you don't want to use transplitted to ES5 code, you can use included
ES2015 version.

You can directly import this version:

```js
import createSubscribedComponent from 'preact-small-redux/es2015';
```

Or specify alias in Webpack config:

```js
{
	// …
	resolve: {
		extensions: ['.ts', '.tsx', '.js'],
		alias: {
			"preact-small-redux": 'preact-small-redux/es2015',
		},
	},
};
```

## How it works

Package provides function `createSubscribedComponent` that returns base
(abstract) class for your components, which should be subscribed to Redux
store changes.

It looks like:

```ts
/**
 * Abstract Class of Component with subscription to Store changes.
 * 
 * @template TStoreState Redux state.
 * @template TProps Component properties.
 * @template TState Component state.
 */
abstract class SubscribedComponent<TStoreState, TProps, TState>
	extends Component<TProps, TState>
{
	/**
	 * Dispatches an action. It is the only way to trigger a state change.
	 */
	public dispatch: Dispatch<Action & {[index: string]: any}>;
	
	/**
	 * Handle Store changes.
	 * 
	 * @param state The current state tree of your application.
	 */
	protected abstract storeStateChanged( state: TStoreState ): void;
}
```

You should just implement `storeStateChanged` method, which called when Redux
store changed. In this method you can update local state of the component by
required properties from application state (available as argument), using
`this.setState` method.

Also, you can use Redux `dispatch` function as component’s method, like
`this.dispatch( {type: 'ACTION'} )`.

## Example

```tsx
import {h, render} from 'preact';
import {Action, createStore} from 'small-redux';
import createSubscribedComponent from 'preact-small-redux';

interface State
{
	test: string;
}

const initialState: State = {
	test: 'Hello',
};

function reducer(
	state: State = initialState,
	action: Action,
): State
{
	switch ( action.type )
	{
		case 'TEST':
			return {
				...state,
				test: 'Test',
			};
		
		default:
			return state;
	}
}

const store = createStore( reducer );
const SubscribedComponent = createSubscribedComponent( store );

interface TestState
{
	text: string;
}

class Test extends SubscribedComponent<State, void, TestState>
{
	public render( _props: void, {text}: TestState ): JSX.Element
	{
		return (
			<button
				type="button"
				onClick={this.onClick}
			>
				{text}
			</button>
		);
	}
	
	protected storeStateChanged( {test}: State ): void
	{
		if ( test === this.state.text )
		{
			return;
		}
		
		this.setState( {text: test} );
	}
	
	private onClick = (): void =>
	{
		this.dispatch( {type: 'TEST'} );
	}
}

render( <Test />, document.body );
```
