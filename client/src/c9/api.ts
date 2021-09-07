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
        firstName: string;
        lastName: string;
        contact: {
            email: string;
        }
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

interface UsersResponse {
    versioin: string,
    totalUsers: number,
    users: User[],
}

interface ButtonsResponse {
    version: string;
    buttons: Button[];
}

export interface SessionCreated {
    session: string;
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
    callStatusCode: number;
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
