export class Constants {
  static SERVER_ERROR = 'Something went wrong. Please try again later or contact support at support@ejara.africa';
  static SQL_DEFAULT_OFFSET_VALUE = 0;
  static SQL_DEFAULT_LIMIT_VALUE = 20;
  static SALT_ROUNDS = 10;
  static VALID_USER_TYPES = ['client', 'admin'];
}

export enum ClientScope {
  WEB = 'WEB',
  MOBILE = 'MOBILE',
  MICROSERVICE = 'MICROSERVICE',
}

export enum ClientStatus {
  ACTIVE = 'ACTIVE',
  BLOCKED = 'BLOCKED',
  EXPIRED = 'EXPIRED',
}

export enum SupportedLanguage {
  en = 'en',
  fr = 'fr',
}
