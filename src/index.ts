import { interfaces } from "@mana/extension-lib";
import { IExtension, IExtensionInit, IRegistry } from "@sym20/core";
import { RailItem } from "./ui/RailItem";
import Symbols = interfaces.Symbols;

export default class Extension implements IExtension {
    private _rail: interfaces.rail.IRail;
    private _nav: interfaces.nav.INav;

    public async init(init: IExtensionInit, registry: IRegistry) {
        this._rail = await registry.resolve<interfaces.rail.IRail>(Symbols.IRail);
        this._nav = await registry.resolve<interfaces.nav.INav>(Symbols.INav);

        new RailItem(this._nav, this._rail);
    }
}
