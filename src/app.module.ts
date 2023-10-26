import { MiddlewareConsumer, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { config } from './config/config';
import { AcceptLanguageResolver, HeaderResolver, I18nModule, QueryResolver } from 'nestjs-i18n';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ChangeLanguageMiddleware } from './commons/middlewares/change-language.middleware';
import { MiddlewareConfig } from './config/middleware.config';
import { RepositoryModule } from './repositories/repository.module';
import { ClientModule } from './apis/client/client.module';
import { CustomerModule } from './apis/customer/customer.module';
import { ServiceModule } from './apis/service/service.module';
import { AlertConfigurationModule } from './apis/alert-configuration/alert-configuration.module';
import * as path from 'path';
import { HelperModule } from './helpers/helper.module';
import { IsAdminMiddleware } from './commons/middlewares/is-admin.middleware';
import { IsUserMiddleware } from './commons/middlewares/is-user.middleware';
import { IsClientMiddleware } from './commons/middlewares/is-client.middleware';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    RepositoryModule,
    I18nModule.forRoot({
      fallbackLanguage: config.appDefaultLanguage!,
      loaderOptions: {
        path: path.join(__dirname, '/i18n/'),
        watch: true,
      },
      resolvers: [
        {
          use: HeaderResolver,
          options: ['lang', 'Accept-Language', 'language'],
        },
        {
          use: QueryResolver,
          options: ['lang', 'Accept-Language', 'language'],
        },
        AcceptLanguageResolver,
      ],
    }),
    HelperModule,
    ClientModule,
    CustomerModule,
    ServiceModule,
    AlertConfigurationModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(IsClientMiddleware)
      .exclude(...MiddlewareConfig.isClientMiddleware().excludes)
      .forRoutes(...MiddlewareConfig.isClientMiddleware().includes);

    consumer
      .apply(IsAdminMiddleware)
      .exclude(...MiddlewareConfig.isAdminMiddleware().excludes)
      .forRoutes(...MiddlewareConfig.isAdminMiddleware().includes);

    consumer
      .apply(IsUserMiddleware)
      .exclude(...MiddlewareConfig.IsUserMiddleware().excludes)
      .forRoutes(...MiddlewareConfig.IsUserMiddleware().includes);

    consumer
      .apply(ChangeLanguageMiddleware)
      .exclude(...MiddlewareConfig.changeLanguageMiddleware().excludes)
      .forRoutes(...MiddlewareConfig.changeLanguageMiddleware().includes);
  }
}
