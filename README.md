#　双行文本翻译辅助工具 ：DLTxT Translate Assistant

为文字游戏汉化工作提供软件辅助。
Provides translation support for common type double-line-txt-file-for-translation.
（注：2.0版本之后的设置文件与之前的版本不兼容，更新后所有设置都将失效，需要重新填写设置）


---
## 功能
#### 文本高亮
  区分人名栏，原文，译文。

#### 快捷键：
  - `Alt + Enter` 或 `Ctrl + Enter`移动到下一个译文行标签之后（例如这里的`|`的位置：`☆00000002☆「|`）
  - `Alt + \` 或 `Ctrl + \`移动到上一个译文行标签之后
  - `Ctrl + Alt + Space` 将当前句的第一个字重复一遍并加一个逗号（例`。是吗|，`->`。是、是吗|，`）
  - `Ctrl + Alt + m`使用Moji辞書查词

#### 关键字同步
  - 选中文本中一个词语，可右键定义为该词为关键字
  - 对关键字的翻译会同步到云端，全组共享
  - 该游戏所有出现的关键字都会显示高亮
  - 把鼠标放到高亮的关键字上可以查看其对应翻译
  - 详见`云端同步使用方法`

#### 提取、回注译文
将双行文本中的译文单独提取，用户进行修改（如批量替换）后，再将改变的文本应用回去
  1. 打开双行文本，右键，选择`提取译文`
  2. 此时会提示输入译文行首的正则表达式，本插件支持的格式大多数都不需要输入，**直接回车**就可以了
  　(例：如果使用的格式是译文开头没有标签，但原文开头都以`/`标注的话，则可以输入`[^/]`)
  3. 在右半窗口会显示提取的译文。完成修改之后，在右键菜单中选择 `应用译文至双行文本`，完成
  4. 注：上一步操作可使用`Ctrl + Z`撤销

#### 文本格式化
右键菜单中选择`Format document`可以对译文进行格式化（不影响原文与标签），可根据设置完成以下任意功能：
  - 统一使译文开头的缩进以及对话首尾的括号（`「」`）与原文一致
  - 统一省略号（`"....", "。。。"　->　"……"`）
  - 统一波浪号（`~∼〜　-> ～`）
  - 统一破折号（`"ーーー", "－－－", "---"->"————"`）
  - 统一写反的、或半角的单引号、双引号　
  （`"英双"　“中双”　'英单'　‘中单’　”反的“　->　“英双”　“中双”　‘英单’　‘中单’　“反的”`）
  - 将常用标点符号统一为中文全角标点（`,.:;!?()『』<半角空格><tab> -> ，。：；！？（）“”<全角空格><全角空格>`）
  - 将英文与数字统一为全角（默认关闭）　（`123ABCdef -> １２３ＡＢＣｄｅｆ`）
  - 去除对话句末的句号　（`。」-> 」`）

#### 联网查询
###### Moji辞書
  - 选中一个词，`Ctrl + Alt + m`，或右键，选择`DLTXT: 联网搜索（Moji辞書）`
  - 结果显示在Output面板中（第一次查询可能较慢）
  - Moji辞書不登录时只能显示一个词条，如需查看多个词条请登录
  - 登录/登出：`Ctrl + Shift + p`，搜索`moji`，选择`DLTXT: 登录/登出Moji辞書`
  - 最大显示词条数：请更改设置`dltxt.moji.displayCount`
###### 其他
  - 选中一个词，右键，选择`DLTXT: 联网搜索（引擎x）`
  - 默认引擎1为沪江小D（日=>中），引擎2为weblio類語辞典
  - 在设置中搜索`dltxt.query`可以自定义搜索引擎
  - 查询时会打开默认浏览器（Moji辞書除外），Windows10可以在`默认应用设置`中设置默认浏览器
  
#### 其他功能
  1. `复制原文到未翻译的译文行` （右键或命令框）

---

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
（注：此格式在“提取译文”时不能默认支持，需要手动输入正则表达式：“[^/]”）
－－－－－－－－－－－－－－－－－－－
<0>//Name: 原文（人名）
<0>Name:译文（人名）
<1>//原文
<1>译文
```
#### 如何使用不支持的格式？
1. 左下角打开设置（Settings），搜索dltxt
2. 填写`Original Text Prefix Regex`和`Translated Text Prefix Regex`
3. 关闭文本高亮：`Ctrl + Shift + P`, 输入`color theme`, 选择一个不属于dltxt的theme（因为无法支持文本高亮）
4. 如果第二步填写正确，则除文本高亮外的其他功能均可正常使用

---

## 云端同步使用方法
1. 访问[jsccsj.com](https://jsccsj.com)并注册账号
2. 在你的主页下方创建一个项目，项目名称不能和别人已经创建的项目重复
  - 如果你的组里还有其他组员需要加入当前项目，请在主页中点击项目名称，输入该组员的用户id，并给予其相应权限，点击`设置权限`即可。设置成功后，组员的主页中会显示该项目。
3. 在主页找到你的`APIToken`，并复制
4. 在vscode中左下角打开设置(Settings)，在`User Name`处填写jsccsj.com的用户名
5. 在`Api Token`处填入刚才复制的APIToken
6. 用vscode打开需要翻译的文本**所在的文件夹**，打开一个txt文件，在右键菜单中选择`输入当前项目名称`
7. 输入第2步创建的项目的名称，回车。这一步会让vscode认为当前文件夹里的所有文本都是这个项目的文本
8. 选中你想同步的词（原文），在右键菜单中，选择`DLTXT: 添加词条`，输入中文翻译并回车，词条就被同步到云端了，并且项目内所有人的文本中这个词条都会被高亮

#### 有关权限
- 无：用户无权访问该项目
- 只读：用户只能查寻词条，但不能对词条进行更新
- 读写：用户可以读取词条、更新词条、增加新词条
- 管理员：在读写权限的基础上，用户还能改变当前项目中其他用户的权限，并可以删除该项目
----

## 使用建议
为了更好的体验，建议对vscode进行如下设置：
- 右下角打开设置`Settings`,
  1. 搜索 `editor.wordSeparators` <br>
  2. 改成 ``~`!@#$%^&*()-=+[{]}\|;:'",.<>/?★☆○●「」『』，、。！？…`` (这样就可以用 `ctrl+Left` `ctrl+right` 了.) <br>
  3. 搜索 `font family` <br>
  4. 点击 `Workspace` <br>
  5. 把 `Editor: Font Family` 设成  `SimHei` （黑体） <br>

---

## 已知问题
2.3及以下版本在自动添加括号时，有可能漏添、多添，问题已在2.4版本中修复

---
## Release Notes

#### 2.4
- 大幅提高文本格式化算法可靠性，解决了添括号时对『双层直角括号』处理不正确的问题
- 优化运行速度

#### 2.3
- 快捷键：重复当前句子的第一个字
- theme: light

#### 2.2
- 联网查词

#### 2.1
- 命令整合至右键菜单，增加易用性
- 应用单行译文时不再需要选中双行文本

#### 2.0
- 格式化文本：功能增至8种
- 更新设置格式（与之前版本不兼容，需要重新填写设置）

#### 1.2
- 格式化文本；自动添加空格、括号

#### 1.1
- 提取译文
- 将修改后的译文再应用到双行文本中

#### 1.0
- 项目管理
  - 添加、删除项目
  - 将其他用户添加到自己的项目
  - 更改自己管理的项目中的其他用户的权限
- 用户只能访问有权访问的项目
- 用户需要使用用户名和APIToken才能使用云端同步功能
- 因为数据库更新，服务器停止了对1.0之前版本的支持

#### 0.9
- keyword defining/highlighting/syncing (beta)
- `Ctrl + Enter` and `Ctrl + \` gives the same effect as `Alt + ...`

#### 0.2
- syntax highlights for common formats
  - auto name tag inferring
- hotkey support for common formats
  - the format is customizable if your format is not in common formats


### 0.1
- syntax highlights for certain double-line-txt-files-for-translation
- hotkey to nagivate 
  - `Alt + Enter` go to next line to edit
  - `Alt + \` go to previous line to edit
