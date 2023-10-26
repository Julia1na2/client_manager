export class CreateAlertConfigurationDto {
  sendSlackAlert: boolean;
  sendEmail?: boolean;
  serviceId?: number;
  emailAddressRecipients?: any;
}

export class GetAlertConfigurationParams {
  sendSlackAlert?: boolean;
  sendEmail?: boolean;
  serviceId?: number;
  limit?: number;
  offset?: number;
}

export class GetAlertConfigurationHistoryParams {
  createdBy?: number;
  serviceId?: number;
  limit?: number;
  offset?: number;
}

export class UpdateAlertConfigurationDto {
  reason: string;
  sendSlackAlert?: boolean;
  sendEmail?: boolean;
  serviceId?: number;
  emailAddressRecipients?: any;
}
