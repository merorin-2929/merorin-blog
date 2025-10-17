import fs from "fs";
import path from "path";
import ogs from "open-graph-scraper";

// キャッシュ保存先
const cacheFile = path.resolve(".cache/ogp.json");

// キャッシュ読み込み
let cache = {};
if (fs.existsSync(cacheFile)) {
    cache = JSON.parse(fs.readFileSync(cacheFile, "utf-8"));
}

// キャッシュ保存関数
function saveCache() {
    fs.mkdirSync(path.dirname(cacheFile), { recursive: true });
    fs.writeFileSync(cacheFile, JSON.stringify(cache, null, 2));
}

/**
 * OGP情報を取得して返す（ビルド時に実行）
 * @param {string} url
 * @returns {Promise<{title: string, description: string, image: string|null, favicon: string, url: string}>}
 */
export async function getOGP(url) {
    // キャッシュにあれば即返す
    if (cache[url]) return cache[url];

    // URLの検証
    let parsedUrl;
    try {
        parsedUrl = new URL(url);
    } catch (e) {
        console.error(`[OGP] Invalid URL: ${url}`, e.message);
        const fallbackResult = {
            url,
            title: "リンクが無効です",
            description: "",
            image: null,
            favicon: "/favicon.svg",
        };
        cache[url] = fallbackResult;
        saveCache();
        return fallbackResult;
    }

    // デフォルトのフォールバック値
    let result = {
        url,
        title: parsedUrl.hostname || url,
        description: "",
        image: null,
        favicon: `https://www.google.com/s2/favicons?domain=${parsedUrl.hostname}`,
    };

    try {
        const { result: og } = await ogs({
            url,
            timeout: 12000,
            headers: {
                "User-Agent": "Mozilla/5.0 (compatible; OGP-Scraper/1.0)",
            },
        });

        // タイトルの取得（複数のソースから試行）
        result.title =
            og?.ogTitle ||
            og?.twitterTitle ||
            og?.title ||
            parsedUrl.hostname ||
            url;

        // 説明の取得
        result.description =
            og?.ogDescription ||
            og?.twitterDescription ||
            og?.description ||
            "";

        // 画像の取得
        if (Array.isArray(og?.ogImage) && og.ogImage.length > 0) {
            result.image = og.ogImage[0].url || null;
        } else if (og?.ogImage?.url) {
            result.image = og.ogImage.url;
        } else {
            result.image = null;
        }

        // ファビコンの取得
        result.favicon = `https://www.google.com/s2/favicons?domain=${parsedUrl.hostname}`;

        console.log(`[OGP] Success: ${url} - "${result.title}"`);
    } catch (e) {
        // エラーメッセージの安全な取得
        const errorMessage = e?.message || e?.toString() || "Unknown error";

        // エラーの種類に応じた詳細なログ
        if (errorMessage.includes("timeout")) {
            console.warn(`[OGP] Timeout: ${url} - タイムアウトしました`);
        } else if (
            errorMessage.includes("ENOTFOUND") ||
            errorMessage.includes("ECONNREFUSED")
        ) {
            console.warn(
                `[OGP] Network Error: ${url} - ネットワークエラーです`,
            );
        } else if (errorMessage.includes("404")) {
            console.warn(`[OGP] Not Found: ${url} - ページが見つかりません`);
        } else {
            console.error(`[OGP] Error: ${url} - ${errorMessage}`);
        }

        // エラー時も最低限の情報は提供
        result.title = parsedUrl.hostname || url;
        result.description = "";
        result.image = null;
        result.favicon = `https://www.google.com/s2/favicons?domain=${parsedUrl.hostname}`;
    }

    // キャッシュ保存
    cache[url] = result;
    saveCache();

    return result;
}