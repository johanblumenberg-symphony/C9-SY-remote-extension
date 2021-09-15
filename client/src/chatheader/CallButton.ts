import { interfaces } from '@mana/extension-lib';
import { ChangeTracker } from '@symphony/rtc-react-state';
import { createUpdater } from '@symphony/symphony-rtc/dist/js/utils/createUpdater';
import { createSelector } from '@symphony/symphony-rtc/dist/js/utils/createSelector';

import IStatefulActionButton = interfaces.actionButton.IStatefulActionButton;
import StateChangeCallback = interfaces.actionButton.StateChangeCallback;
import StatefulButtonDisplay = interfaces.actionButton.StatefulButtonDisplay;
import ButtonAction = interfaces.actionButton.ButtonAction;
import ButtonOrdering = interfaces.actionButton.ButtonOrdering;
import ButtonType = interfaces.actionButton.ButtonType;
import ButtonState = interfaces.actionButton.ButtonState;
import IconType = interfaces.actionButton.IconType;
import { C9Store } from '../c9/C9Store';
import { Button } from '../c9/api';

export class CallButton implements IStatefulActionButton {
    public readonly type = ButtonType.STATEFUL;
    public readonly order = ButtonOrdering.DEFAULT;

    private _subscribers: StateChangeCallback[] = [];
    protected _enabled: boolean = true;

    constructor(
        private _changeTracker: ChangeTracker,
        private _store: C9Store,
        private _button: Button,
    ) {
        this._changeTracker.subscribe(this._onChange);
    }

    private _getDisplay = createSelector(
        () => this._enabled,
        () => this._store.getCallStatus(this._button.connectionNumber),
        (enabled, status) => {
            return {
                buttonText: status?.callProperties.userMicOn ? "C9 - Active" : "C9",
                icon: 'micon',
                iconType: IconType.TUI,
                state: enabled ? ButtonState.NORMAL : ButtonState.DISABLED,
                tooltipText: "Call",
            };
        }
    );

    private _onClick() {
        const status = this._store.getCallStatus(this._button.connectionNumber);
        if (status?.callProperties.userMicOn) {
            this._store.releaseCall(this._button.connectionNumber);
        } else {
            this._store.initiateCall(this._button.connectionNumber);
        }
    }

    public handleAction(action: ButtonAction) {
        if (action === ButtonAction.CLICK) {
            this._onClick();
        } else if (action === ButtonAction.REMOVE) {
            this._dispose();
        } else if (action === ButtonAction.DISABLE) {
            this._enabled = false;
        } else if (action === ButtonAction.ENABLE) {
            this._enabled = true;
        }
        return Promise.resolve();
    }

    public getCurrentDisplay(): Promise<StatefulButtonDisplay> {
        return Promise.resolve(this._getDisplay());
    }

    public subscribe(callback: StateChangeCallback): Promise<void> {
        this._subscribers.push(callback);
        return Promise.resolve();
    }

    private _updateSubscribers = createUpdater(
        () => this._getDisplay(),
        display => this._subscribers.forEach(s => s(display))
    );

    private _onChange = () => {
        this._updateSubscribers();
    }

    private _dispose() {
        this._changeTracker.unsubscribe(this._onChange);
    }
}

export function createChatHeaderButtonFactory(
    changeTracker: ChangeTracker,
    store: C9Store,
    userStore: interfaces.data.IUserStore,
): interfaces.chatView.HeaderButtonFactory {

    async function getButton(stream: interfaces.data.IStream, me: interfaces.data.IUser) {
        if (stream.type === 'IM/MIM' && stream.userIds.length === 2) {
            const user = await userStore.findUserById(stream.userIds.find(id => id !== me.id)!);
            if (user) {
                return store.fetchButtonForRemoteUser(user);
            }
        }
        return undefined;
    }

    return async (stream: interfaces.data.IStream) => {
        const me = await userStore.getMyInfo();
        const button = await getButton(stream, me);
        if (button) {
            return new CallButton(changeTracker, store, button);
        } else {
            return undefined;
        }
    };
}
