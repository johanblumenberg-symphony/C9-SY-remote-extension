import { Button, C9API, User } from "./api";
import { memoizePromise } from '@symphony/rtc-memoize';
import { ChangeTracker } from '@symphony/rtc-react-state';

export class C9Store {
    private _currentUser: User;
    private _buttons: Button[];

    constructor(
        private _tracker: ChangeTracker,
        private _api: C9API,
    ) { }

    public fetchUser = memoizePromise(
        () => this._api.getCurrentUser(),
    ).then(user => {
        this._currentUser = user;
        this._tracker.post();
        return user;
    });

    public getCurrentUser() {
        if (!this._currentUser) {
            // eslint-disable-next-line @typescript-eslint/no-floating-promises
            this.fetchUser();
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
}
