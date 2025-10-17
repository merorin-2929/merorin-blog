// script/create.js
import fs from "fs";
import path from "path";

const slug = process.argv[2];

if (!slug) {
	console.error(
		"slugを指定してね",
	);
	process.exit(1);
}

// blog/<slug>/index.mdx のパスを決定
const blogDir = path.join(process.cwd(), "content", "blog", slug);
const filePath = path.join(blogDir, "index.mdx");

// ディレクトリを作成（再帰的）
fs.mkdirSync(blogDir, { recursive: true });

// ひな型のMDXコンテンツ
const content = `---
title: "${slug}"
description: ""
date: ${new Date().toISOString().split("T")[0]}
draft: true
slug: "${slug}"
---

## ${slug}

ここに本文を書きます。
`;

// ファイルが存在しなければ作成
if (fs.existsSync(filePath)) {
	console.error(`⚠️ すでにファイルが存在します: ${filePath}`);
	process.exit(1);
}

fs.writeFileSync(filePath, content, "utf8");
console.log(`✅ 作成しました: ${filePath}`);