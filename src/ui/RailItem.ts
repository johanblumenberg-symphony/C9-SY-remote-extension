import { interfaces } from '@mana/extension-lib';
import { createUpdater } from '@symphony/symphony-rtc/dist/js/utils/createUpdater';
import { createSelector } from '@symphony/symphony-rtc/dist/js/utils/createSelector';
import { C9View } from './C9View';

const { RailLocations, RailItemState } = interfaces.rail;

export class RailItem implements interfaces.rail.IRailItem {
  public location: interfaces.rail.RailLocations = RailLocations.top;

  private _subscribers: Map<interfaces.base.SubscriberId, () => void> = new Map();
  private _nextSubscriberId: number = 0;

  private _navHidden = false;
  private _view: C9View | undefined;

  constructor(
    private _nav: interfaces.nav.INav,
    private _rail: interfaces.rail.IRail,
  ) {
      this._nav.subscribe(this._onNavChange);
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      this._rail.register(this);
  }

  public async subscribe(callback: () => void) {
      this._subscribers.set(this._nextSubscriberId, callback);
      return this._nextSubscriberId++;
  }

  public async unsubscribe(subscriberId: interfaces.base.SubscriberId) {
      this._subscribers.delete(subscriberId);
  }

  public async onClick() {
      if (this._navHidden) {
          this._nav.show();
      }

      if (!this._view) {
          this._view = new C9View();
          this._view.addCloseListener(() => {
              this._view = undefined;
              this._updateSubscribers();
          });

          this._nav.openItem(this._view);
          this._updateSubscribers();
      }
  }

  public async getDisplay() {
      return this._getDisplay();
  }

    private _getDisplay = createSelector(
        () => !!this._view,
        () => this._navHidden,
        (open, navHidden) => {
            return {
                icon: 'micon',
                tooltip: 'C9 Remote',
                state: open && !navHidden ? RailItemState.ACTIVE : RailItemState.PASSIVE,
            };
        },
    );

  private _onNavChange = () => {
      this._navHidden = this._nav.isNavHidden();
      this._updateSubscribers();
  }

  private _updateSubscribers = createUpdater(
      () => this._getDisplay(),
      () => this._subscribers.forEach(s => s()),
  );
}
