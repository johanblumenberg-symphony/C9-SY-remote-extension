import { withStyles, WithStyles } from '@material-ui/core';
import KeyboardArrowLeftIcon from '@material-ui/icons/KeyboardArrowLeft';
import KeyboardArrowRightIcon from '@material-ui/icons/KeyboardArrowRight';
import { connect, ConnectedComponent } from '@symphony/rtc-react-state';
import * as React from 'react';
import { MainPagePresenter } from '../../presentation/MainPagePresenter';
import { styles } from '../styles';

class HeaderView extends ConnectedComponent<WithStyles<typeof styles>> {
    private _main = this.context.get(MainPagePresenter.TypeTag);

    depsToState() {
        return {
            pageNr: this._main.getPage(),
        };
    }

    private _prevPage = () => {
        this._main.prevPage();
    }

    private _nextPage = () => {
        this._main.nextPage();
    }

    render() {
        const { classes } = this.props;
        const { pageNr } = this.depsToState();

        return (
            <div className={ classes.columns } >
                <header className={ classes.header }>
                    <span className={ classes.headerText } >Page { pageNr + 1 }</span>
                    <KeyboardArrowLeftIcon className={ classes.headerIcon } onClick={ this._prevPage } />
                    <KeyboardArrowRightIcon className={ classes.headerIcon } onClick={ this._nextPage } />
                </header>
                <header className={ classes.header }>
                    <span className={ classes.headerText } >FAVORITES</span>
                </header>
            </div>
        );
    }
}

export default withStyles(styles)(connect(HeaderView));
