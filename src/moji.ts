import * as vscode from 'vscode';
import axios from 'axios';
import util = require('util');

const mojiChannel = vscode.window.createOutputChannel('Moji辞書');
function showChannelMsg(channel: vscode.OutputChannel, msg: any) {
	channel.appendLine(msg.toString());
  channel.show(true);
}

interface MojiSession {
  _ApplicationId?: string;
  _InstallationId?: string;
  _ClientVersion?: string;
  error?: string;
};
let mojiSession: MojiSession = {};

export function mojiTranslate(str: string) {
  const printer = (msg: any) => showChannelMsg(mojiChannel, msg);
  const url = 'https://www.mojidict.com/_nuxt/app/b3f87f7f.f1a5be3.js';
  const regAppId = /parseApplicationId_prod:\s*"(\w*)"/;
  const onSessionReady = () => {
    if (mojiSession.error) {
      printer(mojiSession.error);
    } else {
      axios.post('https://api.mojidict.com/parse/functions/search_v3', {
        ...mojiSession,
        "searchText": str,
        "needWords": true,
        "langEnv": "zh-CN_ja"
      }).then((value) => {
        printer(`------${str}------`);
        if (value.data.result.words.length > 0) {
          value.data.result.words.map((w: any) => { printer(w.excerpt) });
        } else {
          printer('（无查询结果）');
        }
        
      }).catch((reason) => {
        printer(reason);
      })
    }
  };
  if (!mojiSession._ApplicationId) {
    axios.get(url)
    .then((value) => {
      const match = regAppId.exec(value.data);
      if (match) {
        mojiSession._ApplicationId = match[1];
        mojiSession.error = '';
      } else {
        mojiSession.error = '找不到_ApplicationId，请检查网络连接。';
      }
    })
    .catch((reason) => {
      mojiSession.error = reason;
    })
    .finally(() => {
      onSessionReady();
    })
  } else {
    onSessionReady();
  }
}