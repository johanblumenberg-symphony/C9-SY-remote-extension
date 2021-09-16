import * as React from 'react';
import { WithStyles, withStyles } from "@material-ui/core";
import { connect, ConnectedComponent } from "@symphony/rtc-react-state";
import { User } from "../../c9/api";
import { C9Store } from "../../c9/C9Store";
import { styles } from "../styles";
import { AppPresenter } from '../../presentation/AppPresenter';

export interface Props {
    user: User;
}

class Name extends ConnectedComponent<WithStyles<typeof styles> & Props> {
    private _store = this.context.get(C9Store.TypeTag);
    private _appPresenter = this.context.get(AppPresenter.TypeTag);

    depsToState() {
        return {
            symUser: this._store.getSymphonyUser(this.props.user.userId),
        };
    }

    private _showProfile = () => {
        const { symUser } = this.depsToState();
        if (symUser) {
            this._appPresenter.showSymUserProfile(symUser.id);
        }
    }

    render() {
        const { classes, user } = this.props;
        const { symUser } = this.depsToState();

        if (symUser) {
            return (
                <a onClick={ this._showProfile } className={ classes.buttonNameLink } >{ user.personalSettings.lastName }</a>
            );
        } else {
            return (
                <span className={ classes.buttonName } >{ user.personalSettings.lastName }</span>
            );
        }
    }
}

export default withStyles(styles)(connect(Name));
