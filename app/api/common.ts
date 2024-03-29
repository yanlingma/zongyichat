import { NextRequest } from "next/server";

import axios from "axios";

export const OPENAI_URL = "api.openai.com";
const DEFAULT_PROTOCOL = "https";
const PROTOCOL = process.env.PROTOCOL ?? DEFAULT_PROTOCOL;
const BASE_URL = process.env.BASE_URL ?? OPENAI_URL;

export async function requestOpenai(req: NextRequest) {
  const controller = new AbortController();
  const authValue = req.headers.get("Authorization") ?? "";
  const openaiPath = `${req.nextUrl.pathname}${req.nextUrl.search}`.replaceAll(
    "/api/openai/",
    "",
  );

  let baseUrl = BASE_URL;

  if (!baseUrl.startsWith("http")) {
    baseUrl = `${PROTOCOL}://${baseUrl}`;
  }

  console.log("[Proxy] ", openaiPath);
  console.log("[Base Url]", baseUrl);

  if (process.env.OPENAI_ORG_ID) {
    console.log("[Org ID]", process.env.OPENAI_ORG_ID);
  }

  const timeoutId = setTimeout(() => {
    controller.abort();
  }, 10 * 60 * 1000);

  const fetchUrl = `${baseUrl}/${openaiPath}`;
  const fetchOptions: RequestInit = {
    headers: {
      "Content-Type": "application/json",
      Authorization: authValue,
      ...(process.env.OPENAI_ORG_ID && {
        "OpenAI-Organization": process.env.OPENAI_ORG_ID,
      }),
    },
    cache: "no-store",
    // redirect: "follow",
    method: req.method,
    body: req.body,
    // @ts-ignore
    // duplex: "half",
    signal: controller.signal,
  };

  try {
    console.log("fetch before...");

    const res = await axios.post(fetchUrl, req.body, {
      headers: {
        "Content-Type": "application/json",
        Authorization: authValue,
        ...(process.env.OPENAI_ORG_ID && {
          "OpenAI-Organization": process.env.OPENAI_ORG_ID,
        }),
      },
      signal: controller.signal,
    });

    // let res: any = null;

    // for (let i = 0; i < 5; i++) {
    //   try {
    //     console.log("fetch before for..." + i);
    //     res = await fetch(fetchUrl, fetchOptions);
    //     console.log("redirected" + res.redirected);
    //     console.log("status" + res.status);
    //     console.log("body" + res.body);
    //     console.log("url" + res.url);
    //     while (res.redirected) {
    //       const redirectURL = res.url;
    //       res = await fetch(redirectURL, fetchOptions);
    //     }
    //     if (!!res) break;
    //   } catch (error) {
    //     console.log("报错啦！");
    //     continue;
    //   }
    // }
    //

    const newHeaders = new Headers(res.headers);
    newHeaders.delete("www-authenticate");

    return new Response(res.data, {
      status: res.status,
      statusText: res.statusText,
      headers: newHeaders,
    });
  } finally {
    clearTimeout(timeoutId);
  }
}
