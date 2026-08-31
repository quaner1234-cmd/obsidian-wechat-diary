# MiMo 文件转 Markdown（fork 功能）

这个 fork 不改变原版“普通记录原文直存”的行为。AI 只在你明确发送“转成 md”之类的命令时调用。

## MiMo 配置

默认已经填好：

- API URL：`https://api.xiaomimimo.com/v1/chat/completions`
- Model：`mimo-v2.5-pro`

你只需要在 Obsidian → WeChat Diary 设置中填写自己的 MiMo API Key。按量付费 Key 通常以 `sk-` 开头；如果使用 Token Plan，请把接口地址改成订阅页提供的完整 `/v1/chat/completions` 地址。

## 使用

在微信里：

1. 直接把文件发给 bot；
2. 再说“转成 md”“把刚才的文件整理成 Markdown”；
3. 结果写入 `日记/converted/YYYY/原文件名.md`，原附件继续保留。

也支持“文件 + 转成 md”同一条消息。

## 第一版范围

直接支持文本类文件：TXT、MD、CSV、TSV、JSON、YAML、HTML、XML、RTF、日志、配置文件和常见代码文本。

暂不支持 PDF、DOC/DOCX、PPT/PPTX、XLS/XLSX。这些格式需要专门的解析器；在没有可靠解析器前，本 fork 会明确提示，不会把二进制内容直接交给模型，也不会假装转换成功。

单文件暂限约 2MB / 60 万字符。
