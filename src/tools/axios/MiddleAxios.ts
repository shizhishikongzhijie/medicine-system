"use client";
import { del, get, patch, post, put } from "./index";

interface nextAxiosProps {
  map: "get" | "put" | "post" | "delete" | "patch";
  url: string;
  data?: any;
  config?: any;
}

export const MiddleAxios = async ({
  map,
  url,
  data,
  config,
}: nextAxiosProps) => {
  let AxiosRes: any;
  let AxiosError: any;
  try {
    switch (map) {
      case "get":
        AxiosRes = await get(url, undefined, undefined, data, config);
        break;
      case "put":
        AxiosRes = await put(url, undefined, undefined, data, config);
        break;
      case "post":
        AxiosRes = await post(url, undefined, undefined, data, config);
        break;
      case "delete":
        AxiosRes = await del(url, undefined, undefined, data, config);
        break;
      case "patch":
        AxiosRes = await patch(url, undefined, undefined, data, config);
    }
  } catch (error: any) {
    AxiosError = error;
  }
  AxiosRes = AxiosRes || AxiosError;
  if (
    AxiosRes?.code !== 200 &&
    AxiosRes?.code !== 302 &&
    AxiosRes?.message != "canceled"
  ) {
    console.log(AxiosRes.message || AxiosRes.error || "未知错误");
  }
  return AxiosRes;
};
