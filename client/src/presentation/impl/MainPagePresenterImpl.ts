import { ChangeTracker } from "@symphony/rtc-react-state";
import { MainPagePresenter } from "../MainPagePresenter";

const NUM_PAGES = 2;

export class MainPagePresenterImpl implements MainPagePresenter {
    private _page = 0;

    constructor(
        private _tracker: ChangeTracker,
    ) { }

    public getPage() {
        return this._page;
    }

    public nextPage() {
        this._page = (this._page + 1) % NUM_PAGES;
        this._tracker.post();
    }

    public prevPage() {
        this._page = (this._page + NUM_PAGES - 1) % NUM_PAGES;
        this._tracker.post();
    }
}
