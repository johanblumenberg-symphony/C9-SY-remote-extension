import { ChangeTracker } from "@symphony/rtc-react-state";
import { MainPresenter } from "../MainPresenter";

export class MainPresenterImpl implements MainPresenter {
    private _page = 0;

    constructor(
        private _tracker: ChangeTracker,
    ) { }

    public getPage(): number {
        return this._page;
    }

    public setPage(page: number): void {
        this._page = page;
        this._tracker.post();
    }
}
