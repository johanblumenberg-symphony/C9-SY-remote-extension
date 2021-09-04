import * as React from 'react';
import HeaderView from './HeaderView';
import ButtonView from './ButtonView';
import { Button } from '../../c9/api';
import { withStyles, WithStyles } from '@material-ui/core/styles';
import { styles } from '../styles';
import { connect, ConnectedComponent } from '@symphony/rtc-react-state';
import { C9Store } from '../../c9/C9Store';
import { MainPagePresenter } from '../../presentation/MainPagePresenter';

class MainView extends ConnectedComponent<WithStyles<typeof styles>> {
    private _c9Store = this.context.get(C9Store.TypeTag);
    private _main = this.context.get(MainPagePresenter.TypeTag);

    depsToState() {
        return {
            pageNo: this._main.getPage(),
            buttons: this._c9Store.getButtons(),
        };
    }

    private _getColumnButtons(col: number): (Button | undefined)[] {
        const { buttons = [], pageNo } = this.depsToState();
        const firstIndex = 16 * pageNo + 8 * col;
        const result: (Button | undefined)[] = buttons.slice(firstIndex, firstIndex + 8);
        for (let i = result.length; i < 8; i++) {
            result.push(undefined);
        }
        return result;
    }

    private _getColumnFavoriteButtons(_col: number): (Button | undefined)[] {
        return [undefined, undefined, undefined, undefined, undefined, undefined, undefined];
    }

    render() {
        const { classes } = this.props;

        return (
            <div className={ classes.rows }>
                <HeaderView />
                <div className={ classes.columns }>
                    <div>
                        { this._getColumnButtons(0).map(b => <ButtonView key={ b?.buttonId } button={ b } />) }
                    </div>
                    <div>
                        { this._getColumnButtons(1).map(b => <ButtonView key={ b?.buttonId } button={ b } />) }
                    </div>
                    <div>
                        { this._getColumnFavoriteButtons(0).map(b => <ButtonView key={ b?.buttonId } button={ b } float />) }
                    </div>
                    <div>
                        { this._getColumnFavoriteButtons(1).map(b => <ButtonView key={ b?.buttonId } button={ b } float />) }
                    </div>
                </div>
            </div>
        );
    }
}

export default withStyles(styles)(connect(MainView));
