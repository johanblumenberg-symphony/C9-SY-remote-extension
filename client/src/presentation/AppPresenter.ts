import { makeTag } from "@symphony/rtc-react-state";

export interface AppPresenter {
    isOpen(): boolean;
    open(): void;
    hide(): void;

    showSymUserProfile(userId: string): void;
}

export namespace AppPresenter {
    export const TypeTag = makeTag<AppPresenter>("AppPresenter");
}
