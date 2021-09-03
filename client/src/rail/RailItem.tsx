import { interfaces } from '@mana/extension-lib';
import { createUpdater } from '@symphony/symphony-rtc/dist/js/utils/createUpdater';
import { createSelector } from '@symphony/symphony-rtc/dist/js/utils/createSelector';
import { ChangeTracker } from '@symphony/rtc-react-state';
import { AppPresenter } from '../presentation/AppPresenter';

const { RailLocations, RailItemState } = interfaces.rail;

export class RailItem implements interfaces.rail.IRailItem {
    public location: interfaces.rail.RailLocations = RailLocations.top;

    private _subscribers: Map<interfaces.base.SubscriberId, () => void> = new Map();
    private _nextSubscriberId: number = 0;

    constructor(
        private _tracker: ChangeTracker,
        private _app: AppPresenter,
    ) {
        this._tracker.subscribe(this._onChange);
    }

    public async subscribe(callback: () => void) {
        this._subscribers.set(this._nextSubscriberId, callback);
        return this._nextSubscriberId++;
    }

    public async unsubscribe(subscriberId: interfaces.base.SubscriberId) {
        this._subscribers.delete(subscriberId);
    }

    public async onClick() {
        if (this._app.isOpen()) {
            this._app.hide();
        } else {
            this._app.open();
        }
    }

    public async getDisplay() {
        return this._getDisplay();
    }

    private _getDisplay = createSelector(
        () => this._app.isOpen(),
        (open) => {
            return {
                icon: 'micon',
                tooltip: 'C9 Remote',
                state: open ? RailItemState.EXCLUSIVE : RailItemState.PASSIVE,
            };
        },
    );

    private _updateSubscribers = createUpdater(
        () => this._getDisplay(),
        () => this._subscribers.forEach(s => s()),
    );

    private _onChange = () => {
        this._updateSubscribers();
    }
}
