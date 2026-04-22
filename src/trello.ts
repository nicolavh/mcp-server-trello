import { z } from "zod";

const TrelloEnvSchema = z.object({
  TRELLO_KEY: z.string().min(1),
  TRELLO_TOKEN: z.string().min(1),
  TRELLO_DEFAULT_BOARD_ID: z.string().optional(),
  TRELLO_DEFAULT_LIST_ID: z.string().optional(),
});

export type TrelloEnv = z.infer<typeof TrelloEnvSchema>;

export function loadTrelloEnv(raw: Record<string, string | undefined>): TrelloEnv {
  return TrelloEnvSchema.parse(raw);
}

export class TrelloClient {
  private readonly baseUrl = "https://api.trello.com/1";
  constructor(
    private readonly key: string,
    private readonly token: string,
  ) {}

  private withAuth(url: URL): URL {
    url.searchParams.set("key", this.key);
    url.searchParams.set("token", this.token);
    return url;
  }

  private async parseErrorBody(res: Response): Promise<string> {
    const text = await res.text().catch(() => "");
    return text ? `\n${text}` : "";
  }

  async requestJson<T>(opts: {
    method: "GET" | "POST" | "PUT" | "DELETE";
    path: string;
    query?: Record<string, string | undefined>;
    bodyType?: "form" | "json";
    body?: Record<string, unknown> | Record<string, string | undefined>;
  }): Promise<T> {
    const url = new URL(this.baseUrl + opts.path);
    if (opts.query) {
      for (const [k, v] of Object.entries(opts.query)) {
        if (v !== undefined && v !== "") url.searchParams.set(k, v);
      }
    }
    this.withAuth(url);

    const headers: Record<string, string> = { accept: "application/json" };
    let body: string | undefined;

    if (opts.bodyType === "json" && opts.body) {
      headers["content-type"] = "application/json";
      body = JSON.stringify(opts.body);
    }

    if (opts.bodyType === "form" && opts.body) {
      headers["content-type"] = "application/x-www-form-urlencoded";
      const form = new URLSearchParams();
      for (const [k, v] of Object.entries(opts.body as Record<string, string | undefined>)) {
        if (v !== undefined && v !== "") form.set(k, v);
      }
      body = form.toString();
    }

    const res = await fetch(url, { method: opts.method, headers, body });
    if (!res.ok) {
      const errBody = await this.parseErrorBody(res);
      throw new Error(`Trello ${opts.method} ${opts.path} failed: ${res.status} ${res.statusText}${errBody}`);
    }
    return (await res.json()) as T;
  }

  async getJson<T>(path: string, query?: Record<string, string | undefined>): Promise<T> {
    return await this.requestJson<T>({ method: "GET", path, query });
  }

  async postForm<T>(
    path: string,
    body: Record<string, string | undefined>,
    query?: Record<string, string | undefined>,
  ): Promise<T> {
    return await this.requestJson<T>({ method: "POST", path, query, bodyType: "form", body });
  }
}

