import { createStyles } from '@material-ui/core/styles';

export const styles = () => createStyles({
    root: {
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        right: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    app: {
        display: 'inline-flex',
        backgroundColor: 'rgb(12, 17, 24)',

        animation: '$slide-in .5s ease-out',
    },

    '@keyframes slide-in': {
        from: { transform: 'translate(-100%,0)' },
        to: { transform: 'translate(0,0)' },
    },

    rows: {
        display: 'flex',
        flexFlow: 'row',
    },
    columns: {
        display: 'flex',
        flexFlow: 'col',
    },

    button: {
        display: 'flex',
        width: 226,
        height: 73,
        margin: 3,

        backgroundColor: 'rgb(28, 39, 60)',
        borderColor: 'rgb(28, 39, 60)',
        borderStyle: 'solid',
        borderWidth: 1,

        '&$empty': {
            borderStyle: 'dashed',
            color: 'rgb(28, 39, 60)',
            backgroundColor: 'rgb(12, 17, 24)',
            justifyContent: 'center',
            alignItems: 'center',
        },
    },

    empty: { },

    buttonLabel: {
        color: 'white',
        margin: 5,
    }
});
