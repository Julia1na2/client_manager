import { RequestMethod } from "@nestjs/common";

type middlewareEntryType = { path: string; method: number };
type middlewareConfigType = {
    excludes: middlewareEntryType[];
    includes: middlewareEntryType[];
}

const genericExcludedRoutes: middlewareEntryType[] = [
    { path: '/', method: RequestMethod.POST },
]

export class MiddlewareConfig {
    static changeLanguageMiddleware(): middlewareConfigType {
        return {
            excludes: [
                ...genericExcludedRoutes,
                { path: '/', method: RequestMethod.GET },
            ],
            includes: [
                { path: '*', method: RequestMethod.ALL },
            ]
        }
    }

    static isAdminMiddleware(): middlewareConfigType {
        return {
            excludes: [
                ...genericExcludedRoutes,
                { path: '/api/v1/clients', method: RequestMethod.POST },
                { path: '/api/v1/customers/:nellysCoinUserId', method: RequestMethod.PUT }
            ],
            includes: [{ path: '*', method: RequestMethod.ALL }]
        }
    }

    static IsUserMiddleware(): middlewareConfigType {
        return {
            excludes: [
                ...genericExcludedRoutes,
            ],
            includes: [
                { path: '/api/v1/customers/:nellysCoinUserId', method: RequestMethod.PUT }
            ]
        }
    }

    static isClientMiddleware(): middlewareConfigType {
        return {
            excludes: [
                ...genericExcludedRoutes,
                { path: '/api/v1/services', method: RequestMethod.POST },
                { path: '/api/v1/clients', method: RequestMethod.POST },
            ],
            includes: [{ path: '*', method: RequestMethod.ALL }]
        }
    }

    static isValidClientMiddleware(): middlewareConfigType {
        return {
            excludes: [
                ...genericExcludedRoutes,
                { path: '/api/v1/services', method: RequestMethod.ALL },
                { path: '/api/v1/clients', method: RequestMethod.GET },
                { path: '/api/v1/clients', method: RequestMethod.PUT },
                { path: '/api/v1/alert-configurations', method: RequestMethod.ALL },
            ],
            includes: [{ path: '/api/v1/clients', method: RequestMethod.POST }]
        }
    }
}
