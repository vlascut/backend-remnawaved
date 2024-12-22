import {
    ClashConfiguration,
    ClashMetaConfiguration,
    SingBoxConfiguration,
    XrayLinksGenerator,
} from './by-subcription-type';
import { SUBSCRIPTION_CONFIG_TYPES, TSubscriptionConfigTypes } from './constants/config-types';
import { IGenerateSubscription } from './interfaces/generate-subscription.interface';
import { parseSingBoxVersion } from '../utils/parse-sing-box-version';
import { FormatHosts } from '../utils/format-hosts';

export function generateSubscription({
    userAgent,
    user,
    hosts,
    config,
    configService,
}: IGenerateSubscription): {
    contentType: string;
    sub: string;
} {
    const configType = parseUserAgentType(userAgent);
    const configParams = SUBSCRIPTION_CONFIG_TYPES[configType];
    const formattedHosts = FormatHosts.format(config, hosts, user, configService);

    const generators = {
        XRAY: () => ({
            sub: XrayLinksGenerator.generateConfig(formattedHosts, configParams.BASE64),
            contentType: configParams.CONTENT_TYPE,
        }),
        CLASH: () => ({
            sub: ClashConfiguration.generateConfig(formattedHosts),
            contentType: configParams.CONTENT_TYPE,
        }),
        CLASH_META: () => ({
            sub: ClashMetaConfiguration.generateConfig(formattedHosts),
            contentType: configParams.CONTENT_TYPE,
        }),
        SING_BOX: () => ({
            sub: SingBoxConfiguration.generateConfig(
                formattedHosts,
                parseSingBoxVersion(userAgent),
            ),
            contentType: configParams.CONTENT_TYPE,
        }),
        STASH: () => ({
            sub: ClashConfiguration.generateConfig(formattedHosts, true),
            contentType: configParams.CONTENT_TYPE,
        }),
    };

    return generators[configType]?.() || { sub: '', contentType: '' };
}

function parseUserAgentType(userAgent: string): TSubscriptionConfigTypes {
    if (!userAgent) return 'XRAY';

    return (
        (Object.entries(SUBSCRIPTION_CONFIG_TYPES).find(
            ([configName, config]) => configName !== 'XRAY' && config.REGEX?.test(userAgent),
        )?.[0] as TSubscriptionConfigTypes) || 'XRAY'
    );
}
