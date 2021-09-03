import * as React from 'react';
import { Button } from '../../c9/api';
import { styles } from '../styles';
import { withStyles, WithStyles } from '@material-ui/core/styles';
import { Icon } from '@material-ui/core';

export interface Props {
    button: Button | undefined;
    float?: boolean;
}

class ButtonView extends React.PureComponent<WithStyles<typeof styles> & Props> {
    render() {
        const { classes, button } = this.props;

        if (button) {
            return (
                <div className={ classes.button }>
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

export default withStyles(styles)(ButtonView);
