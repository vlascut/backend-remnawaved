export const INTERNAL_SQUADS_CONTROLLER = 'internal-squads' as const;

export const INTERNAL_SQUADS_ROUTES = {
    GET: '', // Get list of all internal squads // get
    CREATE: '', // Create new internal squad // post
    UPDATE: '', // Update internal squad by uuid // patch
    GET_BY_UUID: (uuid: string) => `${uuid}`, // Get internal squad by uuid // get
    DELETE: (uuid: string) => `${uuid}`, // Delete internal squad by uuid // delete
} as const;
