import { interfaces, uiComps } from '@mana/extension-lib';
import { createUpdater } from '@symphony/symphony-rtc/dist/js/utils/createUpdater';
import { createSelector } from '@symphony/symphony-rtc/dist/js/utils/createSelector';
import C9Buttons, { Actions } from '../ui/C9App';

const { RailLocations, RailItemState } = interfaces.rail;

export class RailItem extends interfaces.BaseView implements interfaces.rail.IRailItem, interfaces.overlay.IOverlayView {
  public location: interfaces.rail.RailLocations = RailLocations.top;
  public renderer: interfaces.view.Renderer;

  private _subscribers: Map<interfaces.base.SubscriberId, () => void> = new Map();
  private _nextSubscriberId: number = 0;

  private _open = false;

  constructor(
      overlay: interfaces.windowOverlay.IWindowOverlayService,
      private _rail: interfaces.rail.IRail,
  ) {
      super();

      overlay.registerOverlayViewFactory(async () => [this]);
      this.renderer = uiComps.createReactRenderer<{}, Actions>(this, C9Buttons);
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      this._rail.register(this);
  }

  public async subscribe(callback: () => void) {
      this._subscribers.set(this._nextSubscriberId, callback);
      return this._nextSubscriberId++;
  }

  public async unsubscribe(subscriberId: interfaces.base.SubscriberId) {
      this._subscribers.delete(subscriberId);
  }

  public async onClick() {
      this._open = !this._open;
      this._updateSubscribers();
  }

  public async getDisplay() {
      return this._getDisplay();
  }

    private _getDisplay = createSelector(
        () => this._open,
        (open) => {
            return {
                icon: 'micon',
                tooltip: 'C9 Remote',
                state: open ? RailItemState.EXCLUSIVE : RailItemState.PASSIVE,
            };
        },
    );

    getState() {
        return {};
    }

    getActions() {
        return {
            onHide: this._hide
        };
    }

    private _hide = () => {
        this._open = false;
        this._updateSubscribers();
    }

    public getDockingMode(): interfaces.overlay.DockingMode | undefined {
        return this._open ? interfaces.overlay.DockingMode.FLOAT : undefined;
    }

    private _updateSubscribers = createUpdater(
        () => this._getDisplay(),
        () => this._subscribers.forEach(s => s()),
    );
}
