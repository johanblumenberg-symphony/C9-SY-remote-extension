import * as React from 'react';
import { withStyles, WithStyles } from '@material-ui/core/styles';

import { styles } from './styles';
import MainView from './main/MainView';

export interface Actions {
    onHide(): void;
}

class C9App extends React.PureComponent<Actions & WithStyles<typeof styles>> {
    render() {
        const { classes } = this.props;

        return (
            <div onClick={ this.props.onHide } className={ classes.root }>
                <div className={ classes.app }>
                    <MainView />
                </div>
            </div>
        );
    }
}

export default withStyles(styles)(C9App);
