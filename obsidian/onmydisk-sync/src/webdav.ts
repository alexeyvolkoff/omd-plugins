export interface WebDAVEntry {
  href: string;
  displayName: string;
  isDirectory: boolean;
  contentLength?: number;
  lastModified?: string;
}

export class WebDAVClient {
  private baseUrl: string;
  private username: string;
  private password: string;

  constructor(baseUrl: string, username: string, password: string) {
    this.baseUrl = baseUrl.endsWith("/") ? baseUrl : baseUrl + "/";
    this.username = username;
    this.password = password;
  }

  private authHeaders(): HeadersInit {
    return {
      Authorization: `Basic ${btoa(`${this.username}:${this.password}`)}`,
    };
  }

  async testConnection(): Promise<boolean> {
    try {
      const res = await fetch(this.baseUrl, {
        method: "PROPFIND",
        headers: {
          ...this.authHeaders(),
          Depth: "0",
          "Content-Type": "application/xml",
        },
        body: `<?xml version="1.0"?>
<d:propfind xmlns:d="DAV:">
  <d:prop><d:resourcetype/><d:displayname/></d:prop>
</d:propfind>`,
      });
      return res.status >= 200 && res.status < 300;
    } catch {
      return false;
    }
  }

  async list(path: string = "/"): Promise<WebDAVEntry[]> {
    const url = new URL(path, this.baseUrl).toString();
    const res = await fetch(url, {
      method: "PROPFIND",
      headers: {
        ...this.authHeaders(),
        Depth: "1",
        "Content-Type": "application/xml",
      },
      body: `<?xml version="1.0"?>
<d:propfind xmlns:d="DAV:">
  <d:prop>
    <d:resourcetype/>
    <d:displayname/>
    <d:getcontentlength/>
    <d:getlastmodified/>
  </d:prop>
</d:propfind>`,
    });

    if (!res.ok) throw new Error(`WebDAV list failed: ${res.status}`);
    return this.parseMultiStatus(await res.text());
  }

  async get(path: string): Promise<string> {
    const url = new URL(path, this.baseUrl).toString();
    const res = await fetch(url, {
      method: "GET",
      headers: this.authHeaders(),
    });
    if (!res.ok) throw new Error(`WebDAV get failed: ${res.status}`);
    return res.text();
  }

  async put(path: string, content: string): Promise<void> {
    const url = new URL(path, this.baseUrl).toString();
    const res = await fetch(url, {
      method: "PUT",
      headers: {
        ...this.authHeaders(),
        "Content-Type": "text/markdown",
      },
      body: content,
    });
    if (res.status === 409) {
      await this.ensureParentPath(path);
      const retry = await fetch(url, {
        method: "PUT",
        headers: {
          ...this.authHeaders(),
          "Content-Type": "text/markdown",
        },
        body: content,
      });
      if (!retry.ok) throw new Error(`WebDAV put failed: ${retry.status}`);
      return;
    }
    if (!res.ok) throw new Error(`WebDAV put failed: ${res.status}`);
  }

  async delete(path: string): Promise<void> {
    const url = new URL(path, this.baseUrl).toString();
    const res = await fetch(url, {
      method: "DELETE",
      headers: this.authHeaders(),
    });
    if (!res.ok) throw new Error(`WebDAV delete failed: ${res.status}`);
  }

  private async ensureParentPath(filePath: string): Promise<void> {
    const parts = filePath.split("/").filter(Boolean);
    for (let i = 1; i <= parts.length - 1; i++) {
      const dirPath = parts.slice(0, i).join("/") + "/";
      const url = new URL(dirPath, this.baseUrl).toString();
      await fetch(url, {
        method: "MKCOL",
        headers: this.authHeaders(),
      });
    }
  }

  private parseMultiStatus(xml: string): WebDAVEntry[] {
    const doc = new DOMParser().parseFromString(xml, "application/xml");
    const responses = doc.querySelectorAll("response");
    const entries: WebDAVEntry[] = [];

    for (const resp of Array.from(responses)) {
      const href = resp.querySelector("href")?.textContent || "";
      const props = resp.querySelector("propstat > prop");
      if (!props) continue;

      const isDir = !!props.querySelector("resourcetype > collection");
      const name =
        props.querySelector("displayname")?.textContent ||
        href.split("/").filter(Boolean).pop() ||
        href;
      const size = parseInt(
        props.querySelector("getcontentlength")?.textContent || "0",
        10
      );
      const modified = props.querySelector("getlastmodified")?.textContent;

      entries.push({
        href,
        displayName: name,
        isDirectory: isDir,
        contentLength: isDir ? undefined : size,
        lastModified: modified,
      });
    }

    return entries;
  }
}
