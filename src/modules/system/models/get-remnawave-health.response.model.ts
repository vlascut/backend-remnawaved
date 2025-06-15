export class GetRemnawaveHealthResponseModel {
    pm2Stats: {
        name: string;
        memory: string;
        cpu: string;
    }[];

    constructor(data: GetRemnawaveHealthResponseModel) {
        this.pm2Stats = data.pm2Stats;
    }
}
