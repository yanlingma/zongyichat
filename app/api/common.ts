import { NextRequest } from "next/server";

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
    redirect: "follow",
    method: req.method,
    body: req.body,
    // @ts-ignore
    duplex: "half",
    signal: controller.signal,
  };

  try {
    let res = await fetch(fetchUrl, fetchOptions);
    // to prevent browser prompt for credentials
    console.log(res.redirected);
    console.log(res.status);
    console.log(res.statusText);
    console.log(JSON.stringify(res));
    while (res.redirected) {
      const redirectURL = res.url;
      res = await fetch(redirectURL, fetchOptions);
    }
    const newHeaders = new Headers(res.headers);
    newHeaders.delete("www-authenticate");

    return new Response(res.body, {
      status: res.status,
      statusText: res.statusText,
      headers: newHeaders,
    });

    return res;
  } finally {
    clearTimeout(timeoutId);
  }
}
