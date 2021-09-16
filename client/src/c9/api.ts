import { ApplicationError, Http, HttpError } from "@symphony/rtc-http";

export class NotFound extends ApplicationError {
    constructor() {
        super('NOT_FOUND');
    }
}

export class TooManyResults extends ApplicationError {
    constructor() {
        super('TOO_MANY_RESULTS');
    }
}

export interface User {
    userName: string;
    userId: number;
    personalSettings: {
        firmId: number;
        firstName: string;
        lastName: string;
        contact: {
            email: string;
        }
        groupIds: number[];
    }
}

export interface Button {
    buttonId: number;
    buttonLabel: number;
    connectionNumber: string;
    connectionId: number;
    connectionInstanceId: number;
    extensionId: number;
    speakerPosition: number;
}

export interface Connection {
    connectionID: number;
    connectionNumber: string;
    connectionType: 'Shoutdown';
    createdOn: string;
    farEnd?: {
        firmID: number;
        userIDs?: number[];
    }
    nearEnd: {
        firmID: number;
        userIDs: number[];
    }
}

interface UsersResponse {
    versioin: string,
    totalUsers: number,
    users: User[],
}

interface ButtonsResponse {
    version: string;
    buttons: Button[];
}

interface ConnectionsResponse {
    version: string;
    connections: Connection[];
}

export interface SessionCreated {
    session: string;
}

export enum CallStatusCode {
    Offline = 0,
    Idle = 1,
    ConnectedOutbound = 16,
    ConnectedInbound = 17,
    ConnectedTwoWay = 18,
}

export interface CallStatus {
    callId: string;
    userId: number;
    timestamp: string;
    farEndNumber: string[];
    buttonId: number;
    buttonLabel: string;
    nearEndNumber: string;
    nearEndNumberInstance: string;
    callStatusCode: CallStatusCode;
    statusChangeCode: number;
    nearEndReleased: boolean;
    milliDuration: number;

    callProperties: {
        userMicOn: boolean;
    }
    device: string;
    farEnd: {};
    nearEnd: {};
    snapshot: boolean;
}

export namespace CallStatus {
    export function isDisconnected(callStatus: CallStatus | undefined): boolean {
        return !callStatus || (
            callStatus.callStatusCode === CallStatusCode.Offline ||
            callStatus.callStatusCode === CallStatusCode.Idle
        );
    }

    export function isConnected(callStatus: CallStatus | undefined): boolean {
        return !!callStatus && (
            callStatus.callStatusCode === CallStatusCode.ConnectedInbound ||
            callStatus.callStatusCode === CallStatusCode.ConnectedOutbound ||
            callStatus.callStatusCode === CallStatusCode.ConnectedTwoWay
        );
    }

    export function isConnectedInbound(callStatus: CallStatus | undefined): boolean {
        return !!callStatus && (
            callStatus.callStatusCode === CallStatusCode.ConnectedInbound ||
            callStatus.callStatusCode === CallStatusCode.ConnectedTwoWay
        );
    }

    export function isConnectedOutbound(callStatus: CallStatus | undefined): boolean {
        return !!callStatus && (
            callStatus.callStatusCode === CallStatusCode.ConnectedOutbound ||
            callStatus.callStatusCode === CallStatusCode.ConnectedTwoWay
        );
    }
}

export interface CallStatusMessage {
    messageType: 'callStatus';
    messageBody: CallStatus;
}

export interface CallStatusSnapshotMessage {
    messageType: 'callStatusSnapshot';
    messageBody: {
        userId: number;
        callStatusList: CallStatus[];
    }
}

export type SessionMessage = CallStatusMessage | CallStatusSnapshotMessage;

export class C9API {
    constructor(private _http: Http) { }

    public async getCurrentUser(): Promise<User> {
        const res = await this._http.get<UsersResponse>('/cloud9/api/v1/mgmt/user');

        if (res.ok) {
            return res.data.users[0];
        } else if (res.status === 404) {
            throw new NotFound();
        } else {
            throw new HttpError(res);
        }
    }

    public async getUserButtons(): Promise<Button[]> {
        const res = await this._http.get<ButtonsResponse>(`/cloud9/api/v1/mgmt/buttons`);

        if (res.ok) {
            return res.data.buttons;
        } else {
            throw new HttpError(res);
        }
    }

    public async getUser(userId: number): Promise<User> {
        const res = await this._http.get<UsersResponse>(`/cloud9/api/v1/mgmt/users?userId=${userId}`);

        if (res.ok) {
            return res.data.users[0];
        } else {
            throw new HttpError(res);
        }
    }

    public async getUserByEmail(email: string): Promise<User | undefined> {
        const res = await this._http.get<UsersResponse>(`/cloud9/api/v1/mgmt/users?email=${encodeURIComponent(email)}`);

        if (res.ok) {
            return res.data.users[0];
        } else if (res.status === 404) {
            return undefined;
        } else {
            throw new HttpError(res);
        }
    }

    public async getConnections() {
        const res = await this._http.get<ConnectionsResponse>('/cloud9/api/v1/mgmt/connections');

        if (res.ok) {
            return res.data.connections;
        } else {
            throw new HttpError(res);
        }
    }

    public async initiateCall(connectionNumber: string) {
        const res = await this._http.postJson(`/cloud9/api/v1/cti/${connectionNumber}/initiate`, {});

        if (!res.ok) {
            throw new HttpError(res);
        }
    }

    public async releaseCall(connectionNumber: string) {
        const res = await this._http.postJson(`/cloud9/api/v1/cti/${connectionNumber}/release`, {});

        if (!res.ok) {
            throw new HttpError(res);
        }
    }

    public async createSession() {
        const res = await this._http.postJson<SessionCreated>('/cloud9/api/v1/cti/status', {});

        if (res.ok) {
            return res.data;
        } else {
            throw new HttpError(res);
        }
    }

    public async poll(session: string) {
        const res = await this._http.get<SessionMessage>(`/cloud9/api/v1/cti/status?session=${session}`);

        if (res.ok) {
            return res.data;
        } else {
            throw new HttpError(res);
        }
    }
}
