import { VLESS_ROUTE_IDS } from './route-ids.constant';

export function setVlessRouteForUuid(uuid: string, routeId: number | undefined | null): string {
    if (!routeId) {
        return uuid;
    }

    if (typeof routeId !== 'number') {
        return uuid;
    }

    if (routeId > 255) {
        return uuid;
    }

    return uuid.slice(0, -2) + VLESS_ROUTE_IDS[routeId];
}
