import { interfaces } from "@mana/extension-lib";
import { IExtension, IExtensionInit, IRegistry } from "@sym20/core";
import { C9API } from "./c9/api";
import { C9Store, C9StoreImpl } from "./c9/C9Store";
import { RailItem } from "./rail/RailItem";
import { addHeader, createHttp } from "@symphony/rtc-http";
import { ChangeTracker, createChangeTracker, createObjectStore } from "@symphony/rtc-react-state";

import Symbols = interfaces.Symbols;
import { AppPresenter } from "./presentation/AppPresenter";
import { AppPresenterImpl } from "./presentation/impl/AppPresenterImpl";
import { OverlayView } from "./rail/OverlayView";
import { MainPagePresenterImpl } from "./presentation/impl/MainPagePresenterImpl";
import { MainPagePresenter } from "./presentation/MainPagePresenter";
import { createChatHeaderButtonFactory } from "./chatheader/CallButton";

export default class Extension implements IExtension {
    public async init(init: IExtensionInit, registry: IRegistry) {
        const rail = await registry.resolve<interfaces.rail.IRail>(Symbols.IRail);
        const overlay = await registry.resolve<interfaces.windowOverlay.IWindowOverlayService>(Symbols.IWindowOverlay);
        const bootstrap = await registry.resolve<interfaces.data.IBootstrapStore>(Symbols.IBootstrapStore);
        const chatService = await registry.resolve<interfaces.chatView.IChatViewService>(Symbols.IChatViewService);
        const userStore = await registry.resolve<interfaces.data.IUserStore>(Symbols.IUserStore);
        const userProfile = await registry.resolve<any>(Symbols.IProfilePageModalService);

        const tracker = createChangeTracker();
        const container = createObjectStore();

        const http = createHttp({ cache: 'no-cache', mode: 'cors', credentials: 'same-origin' })
            .chain(addHeader('X-Symphony-CSRF-Token', () => bootstrap.getCSRFToken()));

        const api = new C9API(http);
        const store = new C9StoreImpl(tracker, api, userStore);
        container.bind(ChangeTracker.TypeTag).to(tracker);
        container.bind(C9Store.TypeTag).to(store);

        try {
            await store.fetchButtons();

            const appPresenter = new AppPresenterImpl(tracker, userProfile);
            container.bind(AppPresenter.TypeTag).to(appPresenter);
            container.bind(MainPagePresenter.TypeTag).toFactory(() => new MainPagePresenterImpl(tracker));

            // eslint-disable-next-line @typescript-eslint/no-floating-promises
            rail.register(new RailItem(tracker, store, appPresenter));
            overlay.registerOverlayViewFactory(async () => [new OverlayView(tracker, container, appPresenter)]);

            chatService.registerHeaderButtonFactory(createChatHeaderButtonFactory(tracker, store, userStore));
        } catch (e) {
            if (e.code === 'NOT_FOUND') {
                console.warn('No corresponding C9 user found');
            } else {
                throw e;
            }
        }
    }
}
