import { Button, C9API, CallStatus, Connection, User } from "./api";
import { memoizePromise, memoizePromiseId } from '@symphony/rtc-memoize';
import { ChangeTracker, makeTag } from '@symphony/rtc-react-state';
import { interfaces } from '@mana/extension-lib';

export interface C9Store {
    fetchCurrentUser(): Promise<User>;
    getCurrentUser(): User | undefined;
    fetchButtons(): Promise<Button[]>;
    getButtons(): Button[] | undefined;
    fetchButtonForRemoteUser(_user: interfaces.data.IUser): Promise<Button | undefined>;
    getRemoteUsers(connectionNumber: string): User[] | undefined;

    getSymphonyUser(userId: number): interfaces.data.IUser | undefined;
    fetchSymphonyUser(userId: number): Promise<interfaces.data.IUser | undefined>;

    initiateCall(connectionNumber: string): void;
    releaseCall(connectionNumber: string): void;

    getCallStatus(connectionNumber: string): CallStatus | undefined;
    getActiveCallCount(): number;
}

function getUserIds(c: Connection) {
    return [...c.farEnd?.userIDs || [], ...c.nearEnd?.userIDs || []];
}

export class C9StoreImpl implements C9Store {
    private _currentUser: User;
    private _buttons: Button[];
    private _calls: CallStatus[] = [];
    private _remoteUsersByConnection: { [connectionNumber: string]: User[] } = {};
    private _symUsers: { [userId: number]: interfaces.data.IUser } = {};

    constructor(
        private _tracker: ChangeTracker,
        private _api: C9API,
        private _userStore: interfaces.data.IUserStore,
    ) {
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        this._poll();
    }

    public fetchCurrentUser = memoizePromise(
        () => this._api.getCurrentUser(),
    ).then(user => {
        this._currentUser = user;
        this._tracker.post();
        return user;
    });

    public getCurrentUser() {
        if (!this._currentUser) {
            // eslint-disable-next-line @typescript-eslint/no-floating-promises
            this.fetchCurrentUser();
        }
        return this._currentUser;
    }

    public fetchButtons = memoizePromise(
        () => this._api.getUserButtons(),
    ).then(buttons => {
        this._buttons = buttons;
        this._tracker.post();
        return buttons;
    });

    public getButtons() {
        if (!this._buttons) {
            // eslint-disable-next-line @typescript-eslint/no-floating-promises
            this.fetchButtons();
        }
        return this._buttons;
    }

    public fetchUser = memoizePromiseId(
        ((userId: number) => this._api.getUser(userId)) as any as (userId: string) => Promise<User>,
    ).then((_userId, user) => {
        return user;
    }) as any as (userId: number) => Promise<User>;

    public getRemoteUsers(connectionNumber: string) {
        if (!this._remoteUsersByConnection[connectionNumber]) {
            // eslint-disable-next-line @typescript-eslint/no-floating-promises
            this._fetchRemoteUsers(connectionNumber);
        }
        return this._remoteUsersByConnection[connectionNumber];
    }

    private async _fetchRemoteUsers(connectionNumber: string) {
        const me = await this.fetchCurrentUser();
        const connections = await this._fetchConnections();
        const connection = connections.find(c => c.connectionNumber === connectionNumber);
        if (connection) {
            this._remoteUsersByConnection[connectionNumber] = await Promise.all(
                getUserIds(connection).filter(u => u !== me.userId).map(id => this.fetchUser(id)),
            );
            this._tracker.post();
        }
    }

    private _fetchConnections = memoizePromise(
        () => this._api.getConnections(),
    ).then((connections) => {
        return connections;
    });

    private _fetchUserByEmail = memoizePromiseId(
        (email: string) => this._api.getUserByEmail(email),
    ).then((_email: string, user: User) => {
        return user;
    });

    private async _fetchButtonForConnection(connectionNumber: string): Promise<Button | undefined> {
        const buttons = await this.fetchButtons();
        return buttons.find(b => b.connectionNumber === connectionNumber);
    }

    public async fetchButtonForRemoteUser(user: interfaces.data.IUser): Promise<Button | undefined> {
        const c9me = await this.fetchCurrentUser();
        const c9user = await this._fetchUserByEmail(user.email);
        const connections = await this._fetchConnections();

        if (c9user) {
            const firmId = c9me.personalSettings.firmId;
            for (const c of connections) {
                if ((!c.farEnd || (c.farEnd.firmID === firmId)) && (c.nearEnd.firmID === firmId)) {
                    const userIds = getUserIds(c);
                    if (userIds.length === 2 && userIds.includes(c9me.userId) && userIds.includes(c9user.userId)) {
                        return this._fetchButtonForConnection(c.connectionNumber);
                    }
                }
            }
        }

        return undefined;
    }

    public initiateCall(connectionNumber: string) {
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        this._api.initiateCall(connectionNumber);
    }

    public releaseCall(connectionNumber: string) {
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        this._api.releaseCall(connectionNumber);
    }

    public getCallStatus(connectionNumber: string) {
        return this._calls.find(c => c.farEndNumber.includes(connectionNumber));
    }

    public getActiveCallCount(): number {
        return this._calls.length;
    }

    private _applyCallStatus(call: CallStatus) {
        if (CallStatus.isDisconnected(call)) {
            this._calls = this._calls.filter(c => c.callId !== call.callId);
        } else {
            this._calls = [call, ...this._calls.filter(c => c.callId !== call.callId)];
        }
        this._tracker.post();
    }

    private _applyCallStatusSnapshot(calls: CallStatus[]) {
        this._calls = calls;
        this._tracker.post();
    }

    private async _poll() {
        while (true) {
            try {
                await this._pollSession();
            } catch (e) {
                console.error('Failed poll', e);
                await new Promise(r => setTimeout(r, 10000));
            }
        }
    }

    private async _pollSession() {
        console.log('starting new poll session');
        const session = await this._api.createSession();

        while (true) {
            const message = await this._api.poll(session.session);

            if (message) {
                switch (message.messageType) {
                    case 'callStatus':
                        console.log('got callStatus', message.messageBody);
                        this._applyCallStatus(message.messageBody);
                        break;
                    case 'callStatusSnapshot':
                        console.log('got callStatusSnapshot', message.messageBody);
                        this._applyCallStatusSnapshot(message.messageBody.callStatusList);
                        break;
                }
            }
        }
    }

    public getSymphonyUser(userId: number) {
        if (!this._symUsers[userId]) {
            // eslint-disable-next-line @typescript-eslint/no-floating-promises
            this.fetchSymphonyUser(userId);
        }
        return this._symUsers[userId];
    }

    public fetchSymphonyUser = memoizePromiseId(
        (async (userId: number) => {
            const user = await this.fetchUser(userId);
            const users = await this._userStore.searchUsers('', 10, {
                email: user.personalSettings.contact.email,
            });
            return users.items[0];

        }) as any as (userId: string) => Promise<interfaces.data.IUser | undefined>,
    ).then((userId, symUser) => {
        if (symUser) {
            this._symUsers[userId as any as number] = symUser;
            this._tracker.post();
        }
        return symUser;
    }) as any as (userId: number) => Promise<interfaces.data.IUser | undefined>;
}

export namespace C9Store {
    export const TypeTag = makeTag<C9Store>("C9Store");
}
