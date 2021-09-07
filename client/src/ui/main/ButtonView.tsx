import * as React from 'react';
import { Button } from '../../c9/api';
import { styles } from '../styles';
import { withStyles, WithStyles } from '@material-ui/core/styles';
import { Icon } from '@material-ui/core';
import { connect, ConnectedComponent } from '@symphony/rtc-react-state';
import { C9Store } from '../../c9/C9Store';
import classnames from 'classnames';

export interface Props {
    button: Button | undefined;
    float?: boolean;
}

class ButtonView extends ConnectedComponent<WithStyles<typeof styles> & Props> {
    private _store = this.context.get(C9Store.TypeTag);

    depsToState() {
        const { button } = this.props;

        return {
            userMicOn: button && this._store.getCallStatus(button.connectionNumber)?.callProperties.userMicOn,
        };
    }

    private _onClick = () => {
        const { userMicOn } = this.depsToState();

        if (this.props.button) {
            if (userMicOn) {
                this._store.releaseCall(this.props.button.connectionNumber);
            } else {
                this._store.initiateCall(this.props.button.connectionNumber);
            }
        }
    }

    render() {
        const { classes, button } = this.props;
        const { userMicOn } = this.depsToState();

        if (button) {
            return (
                <div className={ classnames(classes.button, { [classes.userMicOn]: userMicOn }) } onClick={ this._onClick }>
                    <span className={ classes.buttonLabel }>{ button.buttonLabel }</span>
                </div>
            );
        } else {
            return (
                <div className={ classnames(classes.button, classes.empty) }>
                    { this.props.float ? "FLOAT" : <Icon>add</Icon> }
                </div>
            );
        }
    }
}

export default withStyles(styles)(connect(ButtonView));
