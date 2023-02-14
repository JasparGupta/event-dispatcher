# event-dispatcher

## Usage
```ts
// dispatch.ts
import create from '@jaspargupta/event-dispatcher';

const events: {
  'partying': <Array<(partying: { hard: boolean }) => void>> [
    function letMumKnow() {
      // ...
    },
    function postOnSocialMedia() {
      // ...  
    },
    function tacticalChunder(partying) {
      if (!partying.hard) return;
      
      // 🤮
    }
  ],
  'other.event': [
    // ...  
  ],
} as const;

const dispatch = create(events);

export default dispatch;

// party.ts
import dispatch from './dispatch';

export default async function party(hard: boolean) {
  void await dispatch('partying', { hard });
}

// secret-party.ts
import dispatch from './dispatch';
import party from './party';

export default async function secretParty() {
  /**
   * Calling withoutEvent will remove all listeners for the given event, then execute the callback, 
   * once the callback has completed, the listeners are then reattached.
   * 
   * withoutEvents does the same thing except removes all event listeners.
   */
  void await dispatch.withoutEvent('party', () => {
    return party(false);
  });
}
```
