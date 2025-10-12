import createClient from "openapi-fetch";
import { paths } from "./schema";

export const baseApiUrl =
  process.env.NODE_ENV === "production" ? "" : "http://localhost:8000";

export const apiClientFetch = createClient<paths, "application/json">({
  baseUrl: baseApiUrl,
  querySerializer: {
    array: {
      style: "form",
      explode: false,
    },
  },
  credentials: "include",
});

// apiClientFetch.use(includeCookiesMiddleware);
