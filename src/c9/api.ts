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

interface UsersResponse {
    versioin: string,
    totalUsers: number,
    users: User[],
}

export class C9API {
    constructor(private _http: Http) { }

    public async getUserByUserName(userName: string) {
        const res = await this._http.postJson<UsersResponse>('/users', {
            userNames: [userName],
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
}
