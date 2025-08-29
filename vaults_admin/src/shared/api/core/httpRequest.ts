import { Method, RequestHeaders } from "./types";
import { ApiError } from "./errors";
import { getSearchParams } from "./getSearchParams";

export type FetchFunction = <T>(
  endpoint: string,
  params?: object,
  method?: Method,
) => Promise<T>;

export async function httpRequest<T>(
  endpoint = "",
  params = {},
  method = Method.GET,
) {
  const urlSearchParams = getSearchParams(params).toString();

  const fetchUrl = `https://api.locus.wiki/v1/${endpoint}${
    method === Method.GET
      ? `${urlSearchParams ? `?${urlSearchParams}` : ""}`
      : ""
  }`;

  const headers: RequestHeaders = {
    "Content-Type": "application/json",
  };

  const response = await fetch(fetchUrl, {
    headers,
    method,
    ...(method !== Method.GET
      ? {
          body: JSON.stringify(params),
        }
      : {}),
  });

  const data = await response.json();

  if (response.ok) {
    return data as T;
  }

  throw new ApiError(response.status, data.message);
}
