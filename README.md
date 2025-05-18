# Word Recite Mini Program

一个基于微信小程序与云开发的单词学习应用。项目提供今日计划、单词卡翻面、音节切分、TTS 发音、拼写测试、错词复习、学习统计与云端进度同步。

## 功能

- 首页展示今日学习目标、当前词书和完成进度
- 单词卡支持翻面、音节切分、掌握状态切换
- 复用同一个 `InnerAudioContext` 播放 TTS，兼容 iOS 首次播放
- 拼写测试即时判分，错词自动进入复习队列
- 学习进度、测试结果与错词状态增量同步到云数据库
- 根据错词掌握程度计算下一次复习时间
- 统计连续打卡、正确率和累计学习量

## 目录

```text
word-recite-miniprogram/
├─ miniprogram/          # 小程序端
├─ cloudfunctions/       # 微信云函数
├─ docs/                 # 数据库、接口与截图
├─ project.config.json
└─ README.md
```

## 本地运行

1. 在微信开发者工具中导入项目根目录。
2. 将 `project.config.json` 中的 `appid` 替换为自己的小程序 AppID。
3. 创建云开发环境并上传 `cloudfunctions` 下的五个云函数。
4. 在云数据库中创建 `users`、`wordbooks`、`words`、`progress`、`mistakes` 集合。
5. 本地词库位于 `miniprogram/data/seed`，云端不可用时仍可完成核心练习。

详细集合字段和云函数参数见 [数据库设计](docs/database.md) 与 [云函数 API](docs/api.md)。

## 提交记录

项目按功能阶段保留了 13 次提交，覆盖 2025-04 至 2025-05 的完整开发过程。首个可演示版本于 2025-05-19 发布说明中完成。

