import { Button, C9API, User } from "./api";
import { memoizePromise } from '@symphony/rtc-memoize';
import { ChangeTracker, makeTag } from '@symphony/rtc-react-state';

export interface C9Store {
    fetchCurrentUser(): Promise<User>;
    getCurrentUser(): User | undefined;
    fetchButtons(): Promise<Button[]>;
    getButtons(): Button[] | undefined;

    initiateCall(connectionNumber: string): void;
    releaseCall(connectionNumber: string): void;
}

export class C9StoreImpl implements C9Store {
    private _currentUser: User;
    private _buttons: Button[];

    constructor(
        private _tracker: ChangeTracker,
        private _api: C9API,
    ) { }

    public fetchCurrentUser = memoizePromise(
        () => this._api.getCurrentUser(),
    ).then(user => {
        this._currentUser = user;
        this._tracker.post();
        return user;
    });

    public getCurrentUser() {
        if (!this._currentUser) {
            // eslint-disable-next-line @typescript-eslint/no-floating-promises
            this.fetchCurrentUser();
        }
        return this._currentUser;
    }

    public fetchButtons = memoizePromise(
        () => this._api.getUserButtons(),
    ).then(buttons => {
        this._buttons = buttons;
        this._tracker.post();
        return buttons;
    });

    public getButtons() {
        if (!this._buttons) {
            // eslint-disable-next-line @typescript-eslint/no-floating-promises
            this.fetchButtons();
        }
        return this._buttons;
    }

    public initiateCall(connectionNumber: string) {
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        this._api.initiateCall(connectionNumber);
    }

    public releaseCall(connectionNumber: string) {
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        this._api.releaseCall(connectionNumber);
    }
}

export namespace C9Store {
    export const TypeTag = makeTag<C9Store>("C9Store");
}
