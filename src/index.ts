/*! ****************************************************************************
Preact bindings for Small-Redux.
https://github.com/m18ru/preact-small-redux
***************************************************************************** */

import {Component} from 'preact';
import {Action, Dispatch, Store, Unsubscribe} from 'small-redux';

// tslint:disable:max-classes-per-file

/**
 * Abstract Class of Component with subscription to Store changes.
 * 
 * @template TStoreState Redux state.
 * @template TProps Component properties.
 * @template TState Component state.
 */
export declare abstract class SubscribedComponent<TStoreState, TProps, TState>
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

/**
 * Create Class of Component with subscription to Store changes.
 * 
 * @template TState State object type.
 * @template TAction Action object type.
 * @param store Redux store object.
 * @returns Abstract Class of Component with subscription to Store changes.
 */
function createSubscribedComponent<TState, TAction extends Action>(
	store: Store<TState, TAction>,
): typeof SubscribedComponent
{
	/**
	 * Abstract Class of Component with subscription to Store changes.
	 * 
	 * @template TStoreState State object type.
	 * @template PropsType Component properties.
	 * @template StateType Component state.
	 */
	abstract class StoreSubscribedComponent<
			TStoreState extends TState,
			TComponentProps,
			TComponentState
		>
		extends Component<TComponentProps, TComponentState>
	{
		/**
		 * Dispatches an action. It is the only way to trigger a state change.
		 */
		public dispatch: Dispatch<Action>;
		
		/**
		 * Abstract Class of Component with subscription to Store changes.
		 * 
		 * @param props Component properties.
		 */
		public constructor( props: TComponentProps )
		{
			super( props );
			this.storeStateChanged( store.getState() as TStoreState );
			this.dispatch = store.dispatch;
			
			// We should override componentDidMount and componentWillUnmount
			// methods with subscribe/unsubscribe injection to protect
			// from being overridden in subclass.
			
			let unsubscribe: Unsubscribe | undefined;
			
			// Subscribe when added to DOM.
			
			const originalComponentDidMount = this.componentDidMount;
			
			this.componentDidMount = function componentDidMount(
				this: StoreSubscribedComponent<
					TStoreState,
					TComponentProps,
					TComponentState
				>,
			): void
			{
				unsubscribe = store.subscribe(
					() => this.storeStateChanged(
						store.getState() as TStoreState,
					),
				);
				
				if ( originalComponentDidMount )
				{
					originalComponentDidMount.call( this );
				}
			};
			
			// Unsubscribe before removing from DOM.
			
			const originalComponentWillUnmount = this.componentWillUnmount;
			
			this.componentWillUnmount = function componentWillUnmount(
				this: StoreSubscribedComponent<
					TStoreState,
					TComponentProps,
					TComponentState
				>,
			): void
			{
				if ( unsubscribe )
				{
					unsubscribe();
					unsubscribe = undefined;
				}
				
				if ( originalComponentWillUnmount )
				{
					originalComponentWillUnmount.call( this );
				}
			};
		}
		
		/**
		 * Rendered component mounted to the DOM.
		 */
		public componentDidMount?(): void;
		
		/**
		 * Before component will be unmounted and destroyed.
		 */
		public componentWillUnmount?(): void;
		
		/**
		 * Handle Store changes.
		 * 
		 * @param state The current state tree of your application.
		 */
		protected abstract storeStateChanged( state: TStoreState ): void;
	}
	
	// We should use `as any` to prevent unnecessary inheritance from
	// `SubscribedComponent` because of protected method.
	return StoreSubscribedComponent as any as typeof SubscribedComponent;
}

/**
 * Module.
 */
export {
	createSubscribedComponent as default,
};
