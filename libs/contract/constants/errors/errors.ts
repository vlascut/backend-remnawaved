export const ERRORS = {
    INTERNAL_SERVER_ERROR: { code: 'A001', message: 'Server error', httpCode: 500 },
    LOGIN_ERROR: { code: 'A002', message: 'Login error', httpCode: 500 },
    UNAUTHORIZED: { code: 'A003', message: 'Unauthorized', httpCode: 401 },
    FORBIDDEN_ROLE_ERROR: { code: 'A004', message: 'Forbidden role error', httpCode: 403 },
    CREATE_API_TOKEN_ERROR: { code: 'A005', message: 'Create API token error', httpCode: 500 },
    DELETE_API_TOKEN_ERROR: { code: 'A006', message: 'Delete API token error', httpCode: 500 },
    REQUESTED_TOKEN_NOT_FOUND: {
        code: 'A007',
        message: 'Requested token not found',
        httpCode: 404,
    },
    FIND_ALL_API_TOKENS_ERROR: {
        code: 'A008',
        message: 'Find all API tokens error',
        httpCode: 500,
    },
    GET_PUBLIC_KEY_ERROR: {
        code: 'A009',
        message: 'Get public key error',
        httpCode: 500,
    },
    ENABLE_NODE_ERROR: {
        code: 'A010',
        message: 'Enable node error',
        httpCode: 500,
    },
    NODE_NOT_FOUND: {
        code: 'A011',
        message: 'Node not found',
        httpCode: 404,
    },
    CONFIG_NOT_FOUND: {
        code: 'A012',
        message: 'Configuration not found',
        httpCode: 404,
    },
    UPDATE_CONFIG_ERROR: {
        code: 'A013',
        message: 'Error updating configuration',
        httpCode: 500,
    },
    GET_CONFIG_ERROR: {
        code: 'A014',
        message: 'Error retrieving configuration',
        httpCode: 500,
    },
    DELETE_MANY_INBOUNDS_ERROR: {
        code: 'A015',
        message: 'Delete many inbounds error',
        httpCode: 500,
    },
    CREATE_MANY_INBOUNDS_ERROR: {
        code: 'A016',
        message: 'Create many inbounds error',
        httpCode: 500,
    },
} as const;
