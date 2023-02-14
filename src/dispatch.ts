import { once } from 'node:events';
import { IterableElement } from 'type-fest';
import { AnyFunction } from './types';
import Dispatcher from './dispatcher';

type DispatcherInstance<Events extends Record<string, unknown[]>> = InstanceType<typeof Dispatcher<Events>>;

interface EventDispatcher<Events extends Record<string, Array<AnyFunction>>> {
  <Event extends keyof Events>(event: Event, ...args: Parameters<Events[Event][0]>): Promise<unknown[]>,
  withoutEvent: DispatcherInstance<Events>['withoutEvent'],
  withoutEvents: DispatcherInstance<Events>['withoutEvents'],
}

export default function create<Events extends Record<string, Array<AnyFunction>>>(events: Events): EventDispatcher<Events> {
  const dispatcher = new Dispatcher();

  Object.entries(events).forEach(([event, listeners]) => {
    dispatcher.on(event, async (...args: unknown[]) => {
      dispatcher.emit(`${event}.complete`, await Promise.all(listeners.map(listener => listener(...args))));
    });
  });

  type Args<Event extends keyof Events> = Parameters<IterableElement<Events[Event]>>;

  async function dispatch<E extends keyof Events>(event: E, ...args: Args<E>): Promise<unknown[]> {
    // When using the dispatcher.withoutEvent(s) methods, worried the Promise will never resolve without this.
    if (!dispatcher.listeners(event as string).length) {
      return [];
    }

    try {
      return await once(dispatcher, `${event as string}.complete`);
    } finally {
      dispatcher.emit(event as string, ...args);
    }
  }

  dispatch.withoutEvent = dispatcher.withoutEvent.bind(dispatcher);
  dispatch.withoutEvents = dispatcher.withoutEvents.bind(dispatcher);

  return dispatch;
}
