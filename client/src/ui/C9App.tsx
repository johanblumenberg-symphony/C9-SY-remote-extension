import * as React from 'react';
import { withStyles, WithStyles } from '@material-ui/core/styles';
import { styles } from './styles';
import MainView from './main/MainView';
import { ConnectedComponent } from '@symphony/rtc-react-state';
import { AppPresenter } from '../presentation/AppPresenter';

class C9App extends ConnectedComponent<WithStyles<typeof styles>> {
    private _app = this.context.get(AppPresenter.TypeTag);

    private _hide = () => {
        this._app.hide();
    }

    private _stopPropagation = (event: React.MouseEvent) => {
        event.stopPropagation();
    }

    render() {
        const { classes } = this.props;

        return (
            <div onClick={ this._hide } className={ classes.root }>
                <div className={ classes.app } onClick={ this._stopPropagation }>
                    <MainView />
                </div>
            </div>
        );
    }
}

export default withStyles(styles)(C9App);
