import { createStyles } from '@material-ui/core/styles';

const BACKGROUND_DARK = 'rgb(12, 17, 24)';
const BACKGROUND_LIGHT = 'rgb(28, 39, 60)';
const TEXT_DARK = 'rgb(47, 76, 125)';
const TEXT_LIGHT = 'rgb(255, 255, 255)';
const OUTBOUND_BACKGROUND = 'rgb(9, 145, 78)';
const OUTBOUND_BORDER = 'rgb(28, 173, 101)';
const INBOUND_BACKGROUND = 'rgb(160, 40, 42)';
const INBOUND_BORDER = 'rgb(205, 60, 60)';

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
        backgroundColor: BACKGROUND_DARK,

        animation: '$slide-in .3s ease-in-out',
    },

    '@keyframes slide-in': {
        from: { transform: 'translate(-100%,0)' },
        to: { transform: 'translate(0,0)' },
    },

    rows: {
        display: 'flex',
        flexFlow: 'column',
    },
    columns: {
        display: 'flex',
        flexFlow: 'row',
    },

    button: {
        display: 'flex',
        flexDirection: 'column',
        width: 226,
        height: 73,
        margin: 3,
        padding: 4,

        backgroundColor: BACKGROUND_LIGHT,
        borderColor: BACKGROUND_LIGHT,
        borderStyle: 'solid',
        borderWidth: 1,
        borderRadius: 2,

        '&$empty': {
            borderStyle: 'dashed',
            color: TEXT_DARK,
            backgroundColor: BACKGROUND_DARK,
            justifyContent: 'center',
            alignItems: 'center',
        },

        '&$connectedInbound': {
            backgroundColor: INBOUND_BACKGROUND,
            borderColor: INBOUND_BORDER,
        },

        '&$connectedOutbound': {
            backgroundColor: OUTBOUND_BACKGROUND,
            borderColor: OUTBOUND_BORDER,
        },
    },

    empty: { },
    connectedOutbound: {},
    connectedInbound: {},

    buttonLabel: {
        color: TEXT_LIGHT,
        margin: 1,
        fontSize: 14,
        fontWeight: 'bold',
    },

    buttonName: { },
    buttonNameLink: {
        color: TEXT_LIGHT,

        '&:hover': {
            textDecoration: 'underline',
        }
    },
    buttonNames: {
        color: TEXT_LIGHT,
        margin: 1,
        fontSize: 12,
        fontWeight: 'normal',
    },

    header: {
        display: 'flex',
        backgroundColor: BACKGROUND_LIGHT,
        color: TEXT_LIGHT,
        fontWeight: 'bold',
        borderRadius: 4,
        margin: 3,
        padding: 3,
        width: 1, // Same width on all headers, flex-grow makes sure they grow to the correct size
        flexGrow: 1,
    },

    headerText: {
        flexGrow: 1,
        textAlign: 'center',
    },

    headerIcon: {
        marginLeft: -4,
        marginRight: -4,

        '&:hover': {
            color: TEXT_DARK,
        }
    },
});
