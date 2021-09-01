import { Button, C9API, User } from "../c9/api";
import { memoizePromise } from '@symphony/rtc-memoize';
import { interfaces } from "@mana/extension-lib";
import { ChangeNotification } from '@symphony/symphony-rtc/dist/js/model/utils';

export class C9Store {
    private _currentUser: User;
    private _buttons: Button[];

    constructor(
        private _changeNotification: ChangeNotification,
        private _api: C9API,
        private _userStore: interfaces.data.IUserStore,
    ) { }

    public fetchUser = memoizePromise(async () => {
        const user = await this._userStore.getMyInfo();
        return this._api.getUserByEmail(user.email);
    }).then(user => {
        this._currentUser = user;
        this._changeNotification.post();
        return user;
    });

    public getUser() {
        if (!this._currentUser) {
            // eslint-disable-next-line @typescript-eslint/no-floating-promises
            this.fetchUser();
        }
        return this._currentUser;
    }

    public fetchButtons = memoizePromise(async () => {
        const user = await this.fetchUser();
        return this._api.getUserButtons(user.userId);
    }).then(buttons => {
        this._buttons = buttons;
        this._changeNotification.post();
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
