# 云数据库设计

所有集合均按 `openid` 隔离用户数据。时间字段统一存储为数据库日期类型，客户端缓存则使用 ISO 8601 字符串。

## users

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `_openid` | string | 微信用户唯一标识 |
| `settings.dailyGoal` | number | 每日学习目标，默认 20 |
| `settings.autoPronounce` | boolean | 是否自动播放发音 |
| `createdAt` | date | 首次登录时间 |
| `updatedAt` | date | 最近更新时间 |

索引：`_openid` 唯一索引。

## wordbooks

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `id` | string | 词书稳定 ID，例如 `cet4` |
| `name` | string | 展示名称 |
| `level` | string | 难度标签 |
| `totalWords` | number | 单词数量 |
| `version` | number | 词书内容版本 |
| `sort` | number | 列表排序 |

索引：`id` 唯一索引，`sort` 升序索引。

## words

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `_id` | string | 单词 ID |
| `wordbookId` | string | 所属词书 |
| `word` | string | 英文单词 |
| `phonetic` | string | 音标 |
| `syllables` | string[] | 音节切分 |
| `meaning` | string | 中文释义 |
| `example` | string | 英文例句 |
| `translation` | string | 例句翻译 |
| `sort` | number | 词书内顺序 |
| `version` | number | 增量同步版本 |

联合索引：`wordbookId + sort`；增量索引：`wordbookId + version`。

## progress

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `_openid` | string | 用户标识 |
| `wordbookId` | string | 当前词书 |
| `learnedWordIds` | string[] | 已掌握单词 ID |
| `quizCount` | number | 累计测试题数 |
| `correctCount` | number | 累计答对题数 |
| `studyDates` | string[] | 学习日期，格式 `YYYY-MM-DD` |
| `version` | number | 客户端乐观锁版本 |
| `updatedAt` | date | 最近同步时间 |

索引：`_openid` 唯一索引。

## mistakes

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `_openid` | string | 用户标识 |
| `wordId` | string | 单词 ID |
| `level` | number | 复习阶段，0 至 5 |
| `intervalDays` | number | 当前复习间隔 |
| `dueAt` | date | 下次复习时间 |
| `lastResult` | string | `correct` 或 `wrong` |
| `updatedAt` | date | 最近复习时间 |

联合索引：`_openid + dueAt`；唯一索引：`_openid + wordId`。

## 发布步骤

1. 在云开发控制台创建上述集合。
2. 将集合权限设置为“仅创建者可读写”，云函数使用管理员权限执行。
3. 导入 `miniprogram/data/seed` 中的词书和单词。
4. 上传并部署 `login`、`wordbook`、`progress`、`quiz`、`review` 五个云函数。
5. 在开发者工具中构建 npm，并在真机预览中验证音频与网络域名。

