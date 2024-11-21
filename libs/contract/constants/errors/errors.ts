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
    FIND_ALL_INBOUNDS_ERROR: {
        code: 'A017',
        message: 'Find all inbounds error',
        httpCode: 500,
    },
    CREATE_USER_ERROR: {
        code: 'A018',
        message: 'Failed to create user',
        httpCode: 500,
    },
    USER_USERNAME_ALREADY_EXISTS: {
        code: 'A019',
        message: 'User username already exists',
        httpCode: 400,
    },
    USER_SHORT_UUID_ALREADY_EXISTS: {
        code: 'A020',
        message: 'User short UUID already exists',
        httpCode: 400,
    },
    USER_SUBSCRIPTION_UUID_ALREADY_EXISTS: {
        code: 'A021',
        message: 'User subscription UUID already exists',
        httpCode: 400,
    },
    CREATE_USER_WITH_INBOUNDS_ERROR: {
        code: 'A022',
        message: 'User creation successful, but inbound creation failed. User not created.',
        httpCode: 500,
    },
    CANT_GET_CREATED_USER_WITH_INBOUNDS: {
        code: 'A023',
        message: 'User creation successful, but failed to get created user with inbounds.',
        httpCode: 500,
    },
    GET_ALL_USERS_ERROR: {
        code: 'A024',
        message: 'Get all users error',
        httpCode: 500,
    },
    USER_NOT_FOUND: {
        code: 'A025',
        message: 'User not found',
        httpCode: 404,
    },
    GET_USER_BY_ERROR: {
        code: 'A026',
        message: 'Get user by error',
        httpCode: 500,
    },
    REVOKE_USER_SUBSCRIPTION_ERROR: {
        code: 'A027',
        message: 'Revoke user subscription error',
        httpCode: 500,
    },
    DISABLE_USER_ERROR: {
        code: 'A028',
        message: 'Disable user error',
        httpCode: 500,
    },
    USER_ALREADY_DISABLED: {
        code: 'A029',
        message: 'User already disabled',
        httpCode: 400,
    },
    USER_ALREADY_ENABLED: {
        code: 'A030',
        message: 'User already enabled',
        httpCode: 400,
    },
    ENABLE_USER_ERROR: {
        code: 'A031',
        message: 'Enable user error',
        httpCode: 500,
    },
    CREATE_NODE_ERROR: {
        code: 'A032',
        message: 'Create node error',
        httpCode: 500,
    },
    NODE_NAME_ALREADY_EXISTS: {
        code: 'A033',
        message: 'Node name already exists',
        httpCode: 400,
    },
    NODE_ADDRESS_ALREADY_EXISTS: {
        code: 'A034',
        message: 'Node address already exists',
        httpCode: 400,
    },
    NODE_ERROR_WITH_MSG: {
        code: 'N001',
        message: '',
        httpCode: 500,
        withMessage: (message: string) => ({
            code: 'N001',
            message,
            httpCode: 500,
        }),
    },
    RESTART_NODE_ERROR: {
        code: 'A035',
        message: 'Restart node error',
        httpCode: 500,
    },
    GET_CONFIG_WITH_USERS_ERROR: {
        code: 'A036',
        message: 'Get config with users error',
        httpCode: 500,
    },
} as const;
