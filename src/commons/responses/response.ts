export class Response {
  static withoutData(status: number, message: string) {
    return { status, message };
  }

  static withData(status: number, message: string, data: any) {
    return { status, message, data };
  }
}

export class ResponseWithData {
  status: number;
  message?: string;
  data?: any;
}

export class ResponseWithoutData {
  status: number;
  message: string;
}

export class NoDataResponseBody {
  message: string;
}
