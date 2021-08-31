import { interfaces, uiComps } from '@mana/extension-lib';
import C9Buttons from './C9Buttons';

export class C9View extends interfaces.BaseView implements interfaces.nav.INavItem {
  public renderer: interfaces.view.Renderer;

  constructor() {
      super();
      this.renderer = uiComps.createReactRenderer<{}, {}>(this, C9Buttons);
  }

  getState() {
      return {};
  }

  getActions() {
      return {};
  }

  public onNavHide() {
      return;
  }

  public onNavShow() {
      return;
  }
}
