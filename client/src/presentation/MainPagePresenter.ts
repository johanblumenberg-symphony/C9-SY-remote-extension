import { makeTag } from "@symphony/rtc-react-state";

export interface MainPagePresenter {
    getPage(): number;
    nextPage(): void;
    prevPage(): void;
}

export namespace MainPagePresenter {
    export const TypeTag = makeTag<MainPagePresenter>("MainPagePresenter");
}
