import EventEmitter from 'node:events';
import { AnyFunction } from './types';
import isPromise from './utils/is-promise';

export default class Dispatcher<Events extends Record<string, unknown[]>> extends EventEmitter {
  constructor(options: ConstructorParameters<typeof EventEmitter>[0] = {}) {
    super({ captureRejections: true, ...options });

    this.on('error', console.error);
  }

  /**
   * Remove listeners for given event, then execute callback, then restore listeners for event.
   */
  public withoutEvent<T>(event: keyof Events, callback: () => T): T {
    const listeners = this.listeners(event as string) as AnyFunction[];
    const restore = (value: T): T => {
      try {
        return value;
      } finally {
        listeners.forEach(listener => this.on(event as string, listener));
      }
    };

    this.removeAllListeners(event as string);

    const result = callback();

    return isPromise<T>(result)
      ? result.then(restore) as T
      : restore(result);
  }

  /**
   * Remove all listeners for all events, then execute callback, then restore all event listeners.
   */
  public withoutEvents<T>(callback: () => T): T {
    const events = this.eventNames();
    const eventListeners = events.map(event => [event, this.listeners(event) as AnyFunction[]] as const);
    const restore = (value: T): T => {
      try {
        return value;
      } finally {
        eventListeners.forEach(([event, listeners]) => {
          listeners.forEach(listener => this.on(event, listener));
        });
      }
    };

    this.removeAllListeners();

    const result = callback();

    return isPromise<T>(result)
      ? result.then(restore) as T
      : restore(result);
  }
}
