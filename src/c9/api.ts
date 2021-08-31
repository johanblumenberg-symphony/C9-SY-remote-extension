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

    private async _getUserBy(key: string, value: string): Promise<User> {
        const res = await this._http.postJson<UsersResponse>('/users', {
            [key]: [value],
        });

        if (res.ok) {
            if (res.data.users.length === 1) {
                return res.data.users[0];
            } else if (res.data.users.length === 0) {
                throw new NotFound();
            } else {
                throw new TooManyResults();
            }
        } else {
            throw new HttpError(res);
        }
    }

    public getUserByUserName(userName: string): Promise<User> {
        return this._getUserBy('userNames', userName);
    }

    public getUserByEmail(email: string): Promise<User> {
        return this._getUserBy('emails', email);
    }

    public async getUserButtons(userId: number) {
        const res = await this._http.postJson<ButtonsResponse>(`/users/${userId}/buttons`, {});

        if (res.ok) {
            return res.data.buttons;
        } else {
            throw new HttpError(res);
        }
    }
}
