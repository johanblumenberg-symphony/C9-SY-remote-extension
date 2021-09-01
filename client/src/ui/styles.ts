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
    panel: {
        height: '100%',
        width: '50%',
        backgroundColor: 'white',
        animationName: '$slide-in',
        animationDuration: '0.5s',
    },

    '@keyframes slide-in': {
        from: { width: 0 },
        to: { width: '50%' }
    },
});
