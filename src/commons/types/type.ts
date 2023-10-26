import * as Joi from 'joi';

export type NellysCoinAuthUserType = {
  customer_id: number;
  username: string;
  first_name: string;
  last_name: string;
  email_address: string;
  preferred_language: string;
  phone_number: string;
  short_country_code: string;
  account_status: string;
  customer_type: string;
  kyc_level_number: number;
  kyc_level_name: string;
};

export type JoiPayloadType = {
  joiSchema: Joi.ObjectSchema<any>;
  data: any;
};

export type PaginatorFieldTypes = {
  limit: number;
  offset: number;
};

export type SQLQueryListResponse = {
  data: any[];
  count: number;
  totalCount: number;
}
