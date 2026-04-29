const TREVA_HOME_URL = "https://www.treva.realestate/";
const CDN_PREFIX = "https://cdn.prod.website-files.com/";

type CdnAsset = {
    extension: string;
    tailKey: string;
    url: string;
};

let cachedAssetMap: Map<string, CdnAsset[]> | null = null;

function getExtension(value: string) {
    return value.split(".").pop()?.toLowerCase() ?? "";
}

function safeDecode(value: string) {
    try {
        return decodeURIComponent(value);
    } catch {
        return value;
    }
}

function normalizeTail(value: string) {
    return safeDecode(value)
        .toLowerCase()
        .normalize("NFKD")
        .replace(/[^a-z0-9]+/g, "");
}

function extractCdnUrls(html: string) {
    const urls = new Set<string>();
    const stopChars = new Set(['"', "'", "<", ">", ")", " ", "\n", "\r", "\t", "&"]);
    let cursor = 0;

    while ((cursor = html.indexOf(CDN_PREFIX, cursor)) !== -1) {
        let end = cursor;

        while (end < html.length && !stopChars.has(html.charAt(end))) {
            end += 1;
        }

        const url = html.slice(cursor, end).replace(/[),]+$/g, "");

        if (/\.(avif|webp|png|svg|json|jpg|jpeg)$/i.test(url)) {
            urls.add(url);
        }

        cursor = end + 1;
    }

    return [...urls];
}

async function getAssetMap() {
    if (cachedAssetMap) {
        return cachedAssetMap;
    }

    const response = await fetch(TREVA_HOME_URL, {
        next: { revalidate: 3600 },
    });
    const html = await response.text();
    const assetMap = new Map<string, CdnAsset[]>();

    for (const url of extractCdnUrls(html)) {
        const filename = url.split("/").pop() ?? "";
        const match = filename.match(/^([0-9a-f]{24})_(.+)$/i);

        if (!match) {
            continue;
        }

        const id = match[1];
        const tail = match[2];

        if (!id || !tail) {
            continue;
        }

        const assets = assetMap.get(id) ?? [];

        assets.push({
            extension: getExtension(filename),
            tailKey: normalizeTail(tail),
            url,
        });
        assetMap.set(id, assets);
    }

    cachedAssetMap = assetMap;

    return assetMap;
}

function parseExportedAsset(assetPath: string) {
    const filename = assetPath.split("/").pop() ?? "";
    const match = filename.match(/^[0-9a-f]{10}-([0-9a-f]{24})_(.+)$/i);

    if (!match) {
        return null;
    }

    const id = match[1];
    const tail = match[2];

    if (!id || !tail) {
        return null;
    }

    return {
        extension: getExtension(filename),
        id,
        tailKey: normalizeTail(tail),
    };
}

export async function GET(
    _request: Request,
    { params }: { params: Promise<{ asset: string[] }> },
) {
    const { asset } = await params;
    const parsedAsset = parseExportedAsset(asset.join("/"));

    if (!parsedAsset) {
        return new Response("Asset not found", { status: 404 });
    }

    const assetMap = await getAssetMap();
    const candidates = assetMap.get(parsedAsset.id) ?? [];
    const exactMatch = candidates.find(
        (candidate) =>
            candidate.extension === parsedAsset.extension &&
            candidate.tailKey === parsedAsset.tailKey,
    );
    const extensionMatch = candidates.find(
        (candidate) => candidate.extension === parsedAsset.extension,
    );
    const cdnAsset = exactMatch ?? extensionMatch ?? candidates[0];

    if (!cdnAsset) {
        return new Response("Asset not found", { status: 404 });
    }

    return Response.redirect(cdnAsset.url, 307);
}
