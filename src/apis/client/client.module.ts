import { ClientController } from './client.controller';
import { Module } from "@nestjs/common";
import { ClientService } from './client.service';
import { ClientValidator } from './client.validator';
import { RepositoryModule } from "../../repositories/repository.module";
import { HelperModule } from '../../helpers/helper.module';

@Module({
    imports: [RepositoryModule, HelperModule],
    controllers: [ClientController],
    providers: [ClientService, ClientValidator],
})
export class ClientModule{}
