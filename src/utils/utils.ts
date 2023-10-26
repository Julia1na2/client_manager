import { SupportedLanguage } from './../commons/enums/constants.enum';
import * as uniqid from 'uniqid';

export class Utils {
  static stringToBoolean(value: string): boolean {
    switch (value.toLowerCase().trim()) {
      case "true": case "yes": case "1": return true;
      case "false": case "no": case "0": case null: case undefined: return false;
      default: return Boolean(value);
    }
  }

  static getSupportedLanguage(inputtedLanguage: string): string {
    return !Object.keys(SupportedLanguage).includes(`${inputtedLanguage}`) ? SupportedLanguage.en : `${inputtedLanguage}`;
  }

  static generateUniqueObjectId(idPrefix: string): string {
    return `${uniqid(`${idPrefix}-`)}-${Date.now()}`.toLowerCase();
  }
}
