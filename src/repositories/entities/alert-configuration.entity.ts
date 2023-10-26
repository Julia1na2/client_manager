export class SaveAlertConfigurationParams {
  sendSlackAlert: boolean;
  sendEmail?: boolean;
  serviceId?: number;
  createdBy: number;
  emailAddressRecipients?: any;
}

export class AlertConfigurationFilterParams{
  id?: number;
  serviceId?: number | null;
  createdBy?: number;
  sendSlackAlert?: boolean;
  sendEmail?: boolean;
}

export class AlertConfigurationFilterParamsWithLimits extends AlertConfigurationFilterParams {
  limit: number;
  offset: number;
}

export class UpdateAlertConfigurationParams {
  reason: string;
  updatedBy: number;
  sendSlackAlert?: boolean;
  sendEmail?: boolean;
  serviceId?: number;
  emailAddressRecipients?: any;
}
