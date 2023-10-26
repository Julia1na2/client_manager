import { Module } from "@nestjs/common";
import { AlertConfigurationService } from './alert-configuration.service';
import { AlertConfigurationValidator } from './alert-configuration.validator';
import { RepositoryModule } from "../../repositories/repository.module";
import { AlertConfigurationController } from "./alert-configuration.controller";

@Module({
    imports: [RepositoryModule],
    controllers: [AlertConfigurationController],
    providers: [AlertConfigurationService, AlertConfigurationValidator],
    exports: []
})
export class AlertConfigurationModule{}
