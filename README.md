#　双行文本翻译辅助工具 ：DLTxT Translate Assistant

为文字游戏汉化工作提供软件辅助。
Provides Translation support for common type double-line-txt-file-for-translation.

## 功能
- 文本高亮：区分人名栏，原文，译文。
- 快捷键：
  - `Alt + Enter` 或 `Ctrl + Enter`移动到下一个译文行标签之后（例如这里的`|`的位置：`☆00000002☆「|`）
  - `Alt + \` 或 `Ctrl + \`移动到上一个译文行标签之后
- 选中文本中一个词语，可右键定义为该词为关键字
  - 对关键字的翻译会同步到云端，全组共享
  - 该游戏所有出现的关键字都会显示高亮
  - 把鼠标放到高亮的关键字上可以查看其对应翻译

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
## 云端同步使用方法
1. 访问[jsccsj.com](https://jsccsj.com)并注册账号
2. 在你的主页下方创建一个项目，项目名称不能和别人已经创建的项目重复
  - 如果你的组里还有其他组员需要加入当前项目，请在主页中点击项目名称，输入该组员的用户id，并给予其相应权限，点击`设置权限`即可。设置成功后，组员的主页中会显示该项目。
3. 在主页找到你的`APIToken`，并复制
4. 在vscode中左下角打开设置(Settings)，在`User Name`处填写jsccsj.com的用户名
5. 在`Api Token`处填入刚才复制的APIToken
6. 用vscode打开需要翻译的文本**所在的文件夹**，按`Ctrl + Shift + P`并在弹窗中输入`set game`，回车
7. 输入第2步创建的项目的名称，回车。这一步会让vscode认为当前文件夹里的所有文本都是这个项目的文本
8. 选中你想同步的词，在右键菜单中，选择`DLTXT: 添加词条`，输入中文翻译并回车，词条就被同步到云端了，并且项目内所有人的文本中这个词条都会被高亮


## 有关权限
- 无：用户无权访问该项目
- 只读：用户只能查寻词条，但不能对词条进行更新
- 读写：用户可以读取词条、更新词条、增加新词条
- 管理员：在读写权限的基础上，用户还能改变当前项目中其他用户的权限，并可以删除该项目

## 使用建议
为了更好的体验，建议对vscode进行如下设置：
- 右下角打开设置`Settings`,
  -> 搜索 `editor.wordSeparators` <br>
  -> 改成 ``~`!@#$%^&*()-=+[{]}\|;:'",.<>/?★☆○●「」『』，、。！？…`` (这样就可以用 `ctrl+Left` `ctrl+right` 了.) <br>
  -> 搜索 `font family` <br>
  -> 点击 `Workspace` <br>
  -> 把 `Editor: Font Family` 设成  `SimHei` （黑体） <br>

## 已知问题
本插件还在测试阶段，可能会有各种未知问题。

## Release Notes

### 1.0
- 项目管理
  - 添加、删除项目
  - 将其他用户添加到自己的项目
  - 更改自己管理的项目中的其他用户的权限
- 用户只能访问有权访问的项目
- 用户需要使用用户名和APIToken才能使用云端同步功能
- 因为数据库更新，服务器停止了对1.0之前版本的支持

### 0.9
- keyword defining/highlighting/syncing (beta)
- `Ctrl + Enter` and `Ctrl + \` gives the same effect as `Alt + ...`

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
