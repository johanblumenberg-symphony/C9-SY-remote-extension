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

export class C9API {
    constructor(private _http: Http) { }

    public async getCurrentUser(): Promise<User> {
        const res = await this._http.get<UsersResponse>('/cloud9/api/v1/user');

        if (res.ok) {
            return res.data.users[0];
        } else if (res.status === 404) {
            throw new NotFound();
        } else {
            throw new HttpError(res);
        }
    }

    public async getUserButtons(): Promise<Button[]> {
        const res = await this._http.get<ButtonsResponse>(`/cloud9/api/v1/buttons`);

        if (res.ok) {
            return res.data.buttons;
        } else {
            throw new HttpError(res);
        }
    }
}
