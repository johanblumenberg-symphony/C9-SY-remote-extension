import { interfaces } from "@mana/extension-lib";
import { IExtension, IExtensionInit, IRegistry } from "@sym20/core";
import { C9API } from "./c9/api";
import { C9Store } from "./c9/C9Store";
import { RailItem } from "./ui/RailItem";
import { PriorityEnabledChangeNotificationImpl } from '@symphony/symphony-rtc/dist/js/model/utils/impl/changeNotification';

import Symbols = interfaces.Symbols;
import { addHeader, createHttp } from "@symphony/rtc-http";

export default class Extension implements IExtension {
    public async init(init: IExtensionInit, registry: IRegistry) {
        const rail = await registry.resolve<interfaces.rail.IRail>(Symbols.IRail);
        const overlay = await registry.resolve<interfaces.windowOverlay.IWindowOverlayService>(Symbols.IWindowOverlay);
        const bootstrap = await registry.resolve<interfaces.data.IBootstrapStore>(Symbols.IBootstrapStore);

        const changeNotification = new PriorityEnabledChangeNotificationImpl();

        const http = createHttp({ cache: 'no-cache', mode: 'cors', credentials: 'same-origin' })
            .chain(addHeader('X-Symphony-CSRF-Token', () => bootstrap.getCSRFToken()));

        const api = new C9API(http);
        const store = new C9Store(changeNotification, api);

        try {
            await store.fetchButtons();
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
