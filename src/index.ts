import { interfaces } from "@mana/extension-lib";
import { IExtension, IExtensionInit, IRegistry } from "@sym20/core";
import { RailItem } from "./ui/RailItem";
import Symbols = interfaces.Symbols;

export default class Extension implements IExtension {
    private _rail: interfaces.rail.IRail;
    private _overlay: interfaces.windowOverlay.IWindowOverlayService;

    public async init(init: IExtensionInit, registry: IRegistry) {
        this._rail = await registry.resolve<interfaces.rail.IRail>(Symbols.IRail);
        this._overlay = await registry.resolve<interfaces.windowOverlay.IWindowOverlayService>(Symbols.IWindowOverlay);

        new RailItem(this._overlay, this._rail);
    }
}
