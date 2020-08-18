#　双行文本翻译辅助工具 ：DLTxT Translate Assistant

为文字游戏汉化工作提供软件辅助。
Provides Translation support for common type double-line-txt-file-for-translation.

## 功能
- 文本高亮：区分人名栏，原文，译文。
- 快捷键：
  - `Alt + Enter`移动到下一个译文行标签之后（例如这里的`|`的位置：`☆00000002☆「|`）
  - `Alt + \`移动到上一个译文行标签之后
- 选中文本中一个词语，可右键定义为该词为关键字
  - 对关键字的翻译会同步到云端，全组共享
  - 该游戏所有出现的关键字都会显示高亮
  - 把鼠标放到高亮的关键字上可以查看其对应翻译
- 使用`set game`指令定义当前在翻译的游戏
  - 如果当前文件夹里只有一个游戏的文本，那只需要设一次即可
  - 如果有多个游戏，建议每个游戏的文本各自放在一个文件夹里面，否则每次切换游戏都要重新输入游戏名

## 格式支持
本插件支持以下任一一种常见格式：
```
★00000002★ 原文
☆00000002☆ 译文
－－－－－－－－－－－－－－－－－－－
○000000○ 原文
●000000● 译文
－－－－－－－－－－－－－－－－－－－
★scn00000★ 原文（标题）
☆scn00000☆ 译文（标题）

★nme00001★ 原文（人名）
☆nme00001☆ 译文（人名）

★txt00002★ 原文（文本）
☆txt00002☆ 译文（文本）
－－－－－－－－－－－－－－－－－－－
[0x00000000] 原文
;[0x00000000] 译文
－－－－－－－－－－－－－－－－－－－
@2
//Name:原文（人名）
译文（人名）
//ReplaceName:原文（实际显示人名）
译文（实际显示人名）
//Text:原文
译文
－－－－－－－－－－－－－－－－－－－
<0>//Name: 原文（人名）
<0>Name:译文（人名）
<1>//原文
<1>译文
```

## 使用建议
为了更好的体验，建议对vscode进行如下设置：
- 右下角打开设置`Settings`,
  -> 搜索 `editor.wordSeparators` <br>
  -> 改成 ``~`!@#$%^&*()-=+[{]}\|;:'",.<>/?★☆○●「」『』，、。！？…`` (这样就可以用 `ctrl+Left` `ctrl+right` 了.) <br>
  -> 搜索 `font family` <br>
  -> 点击 `Workspace` <br>
  -> 把 `Editor: Font Family` 设成  `SimHei` （黑体） <br>

## Features

- syntax highlights for certain double-line-txt-files-for-translation
- hotkey to nagivate 
  - `Alt + Enter` go to next line to edit
  - `Alt + \` go to previous line to edit
- use context menu to define/update keyword, which is automatically synced for each game
- use `set game` command to set the game title that you are currently working on

## Tips

- For a better experience, **in your workspace folder**,
  goto `Settings` (left-bottom corner) <br>
  -> Search for `editor.wordSeparators` <br>
  -> Set it to ``~`!@#$%^&*()-=+[{]}\|;:'",.<>/?★☆○●「」『』，、。！？…`` (This allows you to use `ctrl+Left` `ctrl+right` to nagivate between words.) <br>
  -> Search for `font family` <br>
  -> Click on `Workspace` tab <br>
  -> Set `Editor: Font Family` field to  `SimHei` or your favorite font. <br>


## Requirements

## Extension Settings

## Known Issues

## Release Notes

### 0.9
- keyword defining/highlighting/syncing (beta)

### 0.2
- syntax highlights for common formats
  - auto name tag inferring
- hotkey support for common formats
  - the format is customizable if your format is not in common formats


### 0.1
- syntax highlights for certain double-line-txt-files-for-translation
- hotkey to nagivate 
  - `Alt + Enter` go to next line to edit
  - `Alt + \` go to previous line to edit
