import * as React from 'react';
import { Button } from '../../c9/api';
import { styles } from '../styles';
import { withStyles, WithStyles } from '@material-ui/core/styles';
import { Icon } from '@material-ui/core';
import { connect, ConnectedComponent } from '@symphony/rtc-react-state';
import { C9Store } from '../../c9/C9Store';

export interface Props {
    button: Button | undefined;
    float?: boolean;
}

class ButtonView extends ConnectedComponent<WithStyles<typeof styles> & Props> {
    private _store = this.context.get(C9Store.TypeTag);

    private _initiateCall = () => {
        if (this.props.button) {
            this._store.initiateCall(this.props.button.connectionNumber);
        }
    }

    render() {
        const { classes, button } = this.props;

        if (button) {
            return (
                <div className={ classes.button } onClick={ this._initiateCall }>
                    <span className={ classes.buttonLabel }>{ button.buttonLabel }</span>
                </div>
            );
        } else {
            return (
                <div className={ `${classes.button} ${classes.empty}` }>
                    { this.props.float ? "FLOAT" : <Icon>add</Icon> }
                </div>
            );
        }
    }
}

export default withStyles(styles)(connect(ButtonView));
