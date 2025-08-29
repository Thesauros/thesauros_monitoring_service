export enum Method {
  GET = "get",
  POST = "post",
  DELETE = "delete",
}

export type RequestHeaders = Record<string, string>;

export type ApiResponse<T> = {
  status: number;
  result: T;
};
