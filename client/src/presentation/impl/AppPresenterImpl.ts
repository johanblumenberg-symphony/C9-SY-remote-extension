import { ChangeTracker } from "@symphony/rtc-react-state";
import { AppPresenter } from "../AppPresenter";

export class AppPresenterImpl implements AppPresenter {
    private _open = false;

    constructor(
        private _tracker: ChangeTracker,
    ) { }

    public open() {
        this._open = true;
        this._tracker.post();
    }

    public hide() {
        this._open = false;
        this._tracker.post();
    }

    public isOpen() {
        return this._open;
    }
}
