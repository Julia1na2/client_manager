import { Module } from "@nestjs/common";
import { ClientRepository } from "./client.repository";
import { ServiceRepository } from "./service.repository";
import { CustomerRepository } from "./customer.repository";
import { AlertConfigurationRepository } from "./alert-configuration.repository";

@Module({
        imports: [],
        controllers: [],
        providers: [
                ClientRepository,
                ServiceRepository,
                CustomerRepository,
                AlertConfigurationRepository,
        ],
        exports: [
                ClientRepository,
                ServiceRepository,
                CustomerRepository,
                AlertConfigurationRepository,
        ]
})
export class RepositoryModule { }
