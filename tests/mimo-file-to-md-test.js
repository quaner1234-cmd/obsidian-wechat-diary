const Module = require("module");
const path = require("path");

global.window = { setTimeout, clearTimeout, setInterval, clearInterval };
global.btoa = (s) => Buffer.from(String(s), "binary").toString("base64");

let lastRequest = null;
class Plugin {}
class PluginSettingTab {}
class Modal {}
class Notice {}
class AbstractInputSuggest {}
const chain = new Proxy({}, { get: () => () => chain });
class Setting { constructor() { return chain; } }
const stub = {
  Plugin, PluginSettingTab, Setting, Modal, Notice, AbstractInputSuggest,
  normalizePath: (p) => p,
  Platform: { isDesktop: true },
  requestUrl: async (opts) => {
    lastRequest = opts;
    return { status: 200, json: { choices: [{ message: { content: "```markdown\n# 标题\n\n正文\n```" } }] } };
  },
};
const orig = Module._load;
Module._load = function(req, ...rest) { if (req === "obsidian") return stub; return orig.call(this, req, ...rest); };
const WechatDiaryPlugin = require(path.join(__dirname, "..", "main.js"));
const I = WechatDiaryPlugin.__internals;

let pass = 0, fail = 0;
function check(name, cond, extra) {
  if (cond) { pass++; console.log("  ✓ " + name); }
  else { fail++; console.error("  ✗ " + name + (extra ? " -> " + extra : "")); }
}

(async () => {
  console.log("\n【MiMo file-to-md】");
  check("短命令可识别", I.isConvertToMdCommand("转成 md"));
  check("自然语言命令可识别", I.isConvertToMdCommand("把刚才的文件整理成 Markdown 存到 Obsidian"));
  check("普通日记不会误触", !I.isConvertToMdCommand("今天把报价单整理成 markdown 的思路想清楚了"));
  check("TXT UTF-8 可读", I.decodeTextLikeFile(Buffer.from("你好\n123"), "x.txt") === "你好\n123");
  check("UTF-16LE 可读", I.decodeTextLikeFile(Buffer.concat([Buffer.from([0xff,0xfe]), Buffer.from("你好", "utf16le")]), "x.txt") === "你好");
  let parserKind = "";
  try { I.decodeTextLikeFile(Buffer.from("%PDF"), "x.pdf"); } catch (e) { parserKind = e.kind; }
  check("PDF 明确要求解析器", parserKind === "needs_parser", parserKind);
  check("输出名去掉附件时间前缀", I.safeConvertedBaseName("日记/attachments/2026/2026-08-31-1120-report.csv") === "report");
  check("整份 Markdown 围栏会去掉", I.stripWholeMarkdownFence("```markdown\n# A\n```") === "# A");

  const fakePlugin = {
    settings: { aiApiUrl: "https://api.xiaomimimo.com/v1/chat/completions", aiModel: "mimo-v2.5-pro" },
    getAiKey: () => "sk-test-only"
  };
  const ai = new I.AiClient(fakePlugin);
  const out = await ai.toMarkdown("A,B\n1,2", "x.csv");
  check("MiMo 返回值转成纯 Markdown", out === "# 标题\n\n正文", JSON.stringify(out));
  check("请求走 MiMo URL", lastRequest && lastRequest.url === fakePlugin.settings.aiApiUrl, lastRequest && lastRequest.url);
  const body = JSON.parse(lastRequest.body);
  check("模型名正确", body.model === "mimo-v2.5-pro", body.model);
  check("显式非流式", body.stream === false);
  check("Bearer Key", lastRequest.headers.Authorization === "Bearer sk-test-only");

  console.log(`\n${pass} passed, ${fail} failed`);
  if (fail) process.exit(1);
})();
