import * as React from 'react';
import { interfaces, uiComps } from '@mana/extension-lib';
import { createUpdater } from '@symphony/symphony-rtc/dist/js/utils/createUpdater';
import C9App from '../ui/C9App';
import { ChangeTracker, ObjectStore, ObjectStoreBindingRoot } from '@symphony/rtc-react-state';
import { AppPresenter } from '../presentation/AppPresenter';

export class OverlayView extends interfaces.BaseView implements interfaces.overlay.IOverlayView {
    public renderer: interfaces.view.Renderer;

    private _subscribers: Map<interfaces.base.SubscriberId, () => void> = new Map();
    private _nextSubscriberId: number = 0;

    constructor(
        tracker: ChangeTracker,
        container: ObjectStore,
        private _app: AppPresenter,
    ) {
        super();

        class RootComponent extends React.PureComponent {
            render() {
                return (
                    <ObjectStoreBindingRoot objectStore={ container } >
                        <C9App />
                    </ObjectStoreBindingRoot>
                );
            }
        }

        this.renderer = uiComps.createReactRenderer<{}, {}>(this, RootComponent);
        tracker.subscribe(this._onChange);
    }

    public async subscribe(callback: () => void) {
        this._subscribers.set(this._nextSubscriberId, callback);
        return this._nextSubscriberId++;
    }

    public async unsubscribe(subscriberId: interfaces.base.SubscriberId) {
        this._subscribers.delete(subscriberId);
    }

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
        () => this._app.isOpen(),
        () => this._subscribers.forEach(s => s()),
    );

    private _onChange = () => {
        this._updateSubscribers();
    }
}
