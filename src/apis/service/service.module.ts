import { ServiceController } from './service.controller';
import { Module } from "@nestjs/common";
import { RepositoryModule } from "../../repositories/repository.module";
import { ServiceValidator } from "./service.validator";
import { Services } from './service';

@Module({
    imports: [RepositoryModule],
    controllers: [ServiceController],
    providers: [Services, ServiceValidator],
    exports: []
})
export class ServiceModule { }
