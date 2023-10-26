import { CustomerController } from './customer.controller';
import { Module } from "@nestjs/common";
import { RepositoryModule } from "../../repositories/repository.module";
import { CustomerService } from "./customer.service";
import { CustomerValidator } from "./customer.validator";

@Module({
    imports: [RepositoryModule],
    controllers: [CustomerController],
    providers: [CustomerService, CustomerValidator],
    exports: []
})
export class CustomerModule{ }
