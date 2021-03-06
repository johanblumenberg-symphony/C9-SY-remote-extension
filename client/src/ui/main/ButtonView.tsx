import * as React from 'react';
import { Button, CallStatus } from '../../c9/api';
import { styles } from '../styles';
import { withStyles, WithStyles } from '@material-ui/core/styles';
import { Icon } from '@material-ui/core';
import { connect, ConnectedComponent } from '@symphony/rtc-react-state';
import { C9Store } from '../../c9/C9Store';
import classnames from 'classnames';
import Name from './Name';

export interface Props {
    button: Button | undefined;
    float?: boolean;
}

class ButtonView extends ConnectedComponent<WithStyles<typeof styles> & Props> {
    private _store = this.context.get(C9Store.TypeTag);

    depsToState() {
        const { button } = this.props;

        return {
            callStatus: button && this._store.getCallStatus(button.connectionNumber),
            users: button && this._store.getRemoteUsers(button.connectionNumber),
        };
    }

    private _onClick = () => {
        const { callStatus } = this.depsToState();

        if (this.props.button) {
            if (CallStatus.isConnectedOutbound(callStatus)) {
                this._store.releaseCall(this.props.button.connectionNumber);
            } else {
                this._store.initiateCall(this.props.button.connectionNumber);
            }
        }
    }

    render() {
        const { classes, button } = this.props;
        const { callStatus, users } = this.depsToState();

        const classNames = classnames(classes.button, {
            [classes.connectedOutbound]: CallStatus.isConnectedOutbound(callStatus),
            [classes.connectedInbound]: CallStatus.isConnectedInbound(callStatus),
        });

        if (button) {
            return (
                <div className={ classNames } onClick={ this._onClick }>
                    <div>
                        <span className={ classes.buttonLabel }>{ button.buttonLabel }</span>
                    </div>
                    <div className={ classes.buttonNames }>
                        { users?.slice(0, 3).map(u => <Name key={ u.userId } user={ u } />).reduce((acc, cur) => <>{ acc }, { cur }</>) }
                    </div>
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
