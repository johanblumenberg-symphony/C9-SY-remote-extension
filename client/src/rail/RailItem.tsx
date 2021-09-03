import * as React from 'react';
import { interfaces, uiComps } from '@mana/extension-lib';
import { createUpdater } from '@symphony/symphony-rtc/dist/js/utils/createUpdater';
import { createSelector } from '@symphony/symphony-rtc/dist/js/utils/createSelector';
import C9App from '../ui/C9App';
import { ChangeTracker, ObjectStore, ObjectStoreBinding } from '@symphony/rtc-react-state';
import { AppPresenter } from '../presentation/AppPresenter';

const { RailLocations, RailItemState } = interfaces.rail;

export class RailItem extends interfaces.BaseView implements interfaces.rail.IRailItem, interfaces.overlay.IOverlayView {
    public location: interfaces.rail.RailLocations = RailLocations.top;
    public renderer: interfaces.view.Renderer;

    private _subscribers: Map<interfaces.base.SubscriberId, () => void> = new Map();
    private _nextSubscriberId: number = 0;

    constructor(
        tracker: ChangeTracker,
        container: ObjectStore,
        overlay: interfaces.windowOverlay.IWindowOverlayService,
        private _app: AppPresenter,
        private _tracker: ChangeTracker,
    ) {
        super();

        class RootComponent extends React.PureComponent {
            render() {
                return (
                    <ObjectStoreBinding objectStore={ container } tag={ ChangeTracker.TypeTag } value={ tracker }>
                        <C9App />
                    </ObjectStoreBinding>
                );
            }
        }

        overlay.registerOverlayViewFactory(async () => [this]);
        this.renderer = uiComps.createReactRenderer<{}, {}>(this, RootComponent);
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

    getState() {
        return { };
    }

    getActions() {
        return { };
    }

    public getDockingMode(): interfaces.overlay.DockingMode | undefined {
        return this._app.isOpen() ? interfaces.overlay.DockingMode.FLOAT : undefined;
    }

    private _updateSubscribers = createUpdater(
        () => this._getDisplay(),
        () => this._subscribers.forEach(s => s()),
    );

    private _onChange = () => {
        this._updateSubscribers();
    }
}
