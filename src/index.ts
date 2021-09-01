import { interfaces } from "@mana/extension-lib";
import { IExtension, IExtensionInit, IRegistry } from "@sym20/core";
import { C9API } from "./c9/api";
import { createC9Http } from "./c9/http";
import { C9Store } from "./store/C9Store";
import { RailItem } from "./ui/RailItem";
import { PriorityEnabledChangeNotificationImpl } from '@symphony/symphony-rtc/dist/js/model/utils/impl/changeNotification';

import Symbols = interfaces.Symbols;

declare var API_KEYS: {
    management: {
        apiKey: string;
        apiSecret: string;
    }
};

export default class Extension implements IExtension {
    public async init(init: IExtensionInit, registry: IRegistry) {
        const rail = await registry.resolve<interfaces.rail.IRail>(Symbols.IRail);
        const overlay = await registry.resolve<interfaces.windowOverlay.IWindowOverlayService>(Symbols.IWindowOverlay);
        const userStore = await registry.resolve<interfaces.data.IUserStore>(Symbols.IUserStore);

        const changeNotification = new PriorityEnabledChangeNotificationImpl();

        const http = createC9Http(API_KEYS.management.apiKey, API_KEYS.management.apiSecret);
        const api = new C9API(http);
        const store = new C9Store(changeNotification, api, userStore);

        try {
            await store.fetchUser();
            new RailItem(overlay, rail);
        } catch (e) {
            if (e.code === 'NOT_FOUND') {
                console.warn('No corresponding C9 user found');
            } else {
                throw e;
            }
        }
    }
}
