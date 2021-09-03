
export interface MainPresenter {
    getPage(): number;
    setPage(page: number): void;
}

export namespace MainPresenter {
    export const TypeTag = "MainPresenter";
}
