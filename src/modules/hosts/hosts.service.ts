import { Injectable } from '@nestjs/common';
import { HostsRepository } from './repositories/hosts.repository';

@Injectable()
export class HostsService {
    constructor(private readonly hostsRepository: HostsRepository) {}
}
