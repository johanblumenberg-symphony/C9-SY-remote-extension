import { makeTag } from "@symphony/rtc-react-state";

export interface AppPresenter {
    isOpen(): boolean;
    open(): void;
    hide(): void;
}

export namespace AppPresenter {
    export const TypeTag = makeTag<AppPresenter>("AppPresenter");
}
