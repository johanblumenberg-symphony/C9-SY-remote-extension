import * as React from 'react';
import HeaderView from './HeaderView';
import ButtonView from './ButtonView';
import { Button } from '../../c9/api';
import { withStyles, WithStyles } from '@material-ui/core/styles';
import { styles } from '../styles';

class MainView extends React.PureComponent<WithStyles<typeof styles>> {
    private _getColumnButtons(col: number): (Button | undefined)[] {
        return [undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined];
    }

    private _getColumnFavoriteButtons(col: number): (Button | undefined)[] {
        return [undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined];
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

export default withStyles(styles)(MainView);
