# 云函数 API

客户端统一通过 `miniprogram/services/cloud.js` 调用云函数。响应格式如下：

```json
{
  "ok": true,
  "data": {}
}
```

失败时返回 `ok: false` 与人类可读的 `message`。客户端设置 10 秒超时，并对本地词库保留降级路径。

## login

无参数。根据 `OPENID` 查找用户，不存在时自动创建。

返回：

```json
{
  "ok": true,
  "data": {
    "_id": "user-id",
    "openid": "openid",
    "settings": {
      "dailyGoal": 20,
      "autoPronounce": true
    }
  }
}
```

## wordbook

### `action: "list"`

读取词书列表。

### `action: "page"`

参数：`wordbookId`、`page`、`pageSize`。使用 `skip + limit` 返回分页词表。

### `action: "since"`

参数：`wordbookId`、`sinceVersion`。仅返回版本号大于本地版本的词条，用于增量同步。

## progress

### `action: "get"`

读取当前用户进度。

### `action: "merge"`

参数：`progress`。按 `_openid` 读取现有进度，对已学单词、学习日期和累计答题数取并集后写回；客户端收到结果后再次合并本地缓存。

## quiz

### `action: "grade"`

参数：`wordId`、`answer`。服务端读取标准答案并完成大小写、空格与标点归一化后判分。

## review

### `action: "due"`

返回当前用户已到期的前 20 个错词。

### `action: "answer"`

参数：`mistakeId`、`correct`。根据回答结果推进或重置复习状态机，间隔依次为 0、1、3、7、14、30 天。

