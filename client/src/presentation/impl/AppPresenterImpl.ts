import { ChangeTracker } from "@symphony/rtc-react-state";
import { AppPresenter } from "../AppPresenter";

export class AppPresenterImpl implements AppPresenter {
    private _open = false;

    constructor(
        private _tracker: ChangeTracker,
        private _userProfile: any,
    ) { }

    public open() {
        if (!this._open) {
            this._open = true;
            this._tracker.post();
        }
    }

    public hide() {
        if (this._open) {
            this._open = false;
            this._tracker.post();
        }
    }

    public isOpen() {
        return this._open;
    }

    public showSymUserProfile(userId: string) {
        this.hide();
        this._userProfile.show(userId);
    }
}
