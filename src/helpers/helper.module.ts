import { Module } from "@nestjs/common";
import { SlackCloudNotificationAlert } from "./slack.notification";
import { ClientHelper } from "./client.helper";

@Module({
    providers: [SlackCloudNotificationAlert, ClientHelper],
    exports: [SlackCloudNotificationAlert, ClientHelper],
})
export class HelperModule{ }
