# DLTxT Translate Assistant README

Translation Assistant for double-line-txt-file-for-translation, which looks like any one of these:
```
★00000002★ text
☆00000002☆ text
－－－－－－－－－－－－－－－－－－－
○000000○ text
●000000● text
－－－－－－－－－－－－－－－－－－－
★scn00000★ text
☆scn00000☆ text

★nme00001★ text
☆nme00001☆ text

★txt00002★ text
☆txt00002☆ text
－－－－－－－－－－－－－－－－－－－
[0x00000000] text
;[0x00000000] text
－－－－－－－－－－－－－－－－－－－
@2
//Name:NULL
NULL
//ReplaceName:NULL
NULL
//Text:...
...
－－－－－－－－－－－－－－－－－－－
<0>//Name: text
<0>Name:
<1>//text
<1>text
```

## Features

- syntax highlights for certain double-line-txt-files-for-translation
- hotkey to nagivate 
  - `Alt + Enter` go to next line to edit
  - `Alt + \` go to previous line to edit

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
