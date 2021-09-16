import * as React from 'react';
import { WithStyles, withStyles } from "@material-ui/core";
import { connect, ConnectedComponent } from "@symphony/rtc-react-state";
import { User } from "../../c9/api";
import { C9Store } from "../../c9/C9Store";
import { styles } from "../styles";

export interface Props {
    user: User;
}

class Name extends ConnectedComponent<WithStyles<typeof styles> & Props> {
    private _store = this.context.get(C9Store.TypeTag);

    render() {
        const { classes, user } = this.props;

        return (
            <span className={ classes.buttonName } >{ user.personalSettings.lastName }</span>
        );
    }
}

export default withStyles(styles)(connect(Name));
