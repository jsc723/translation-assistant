import * as vscode from 'vscode';
import axios from 'axios';
import util = require('util');
import { PerformanceObserver } from 'perf_hooks';

const mojiChannel = vscode.window.createOutputChannel('Moji辞書');
function showChannelMsg(channel: vscode.OutputChannel, msg: any) {
	channel.appendLine(msg.toString());
  channel.show(false);
}

interface MojiSession {
  _ApplicationId?: string;
  _InstallationId?: string;
  _ClientVersion?: string;
  _SessionToken?: string;
  error?: string;
};
let mojiSession: MojiSession = {};
export function mojiTranslate(str: string) {
  const printer = (msg: any) => showChannelMsg(mojiChannel, msg);
  const config = vscode.workspace.getConfiguration("dltxt");
  let count = config.get('moji.displayCount') as number;
  if (!count)
    count = 5;
  getSession().then((session: MojiSession) => {
      if (session.error) {
        printer(session.error);
      } else {
        axios.post('https://api.mojidict.com/parse/functions/search_v3', {
          ...session,
          "searchText": str,
          "needWords": true,
          "langEnv": "zh-CN_ja"
        }).then((value) => {
          printer(`------${str}------`);
          if (value.data.result.words.length > 0) {
            value.data.result.words.map((w: any, i: number) => {
              if (i < count) {
                printer(`${i + 1}. ${w.spell}:`);
                printer(`   ${w.excerpt}`);
              }
            });
          } else {
            printer('（无查询结果）');
          }
          
        }).catch((reason) => {
          printer(reason);
        })
      }
  })
}

function getSession(): Promise<MojiSession> {
  const regAppId = /parseApplicationId_prod:\s*"(\w*)"/;
  if (mojiSession._ApplicationId) {
    return Promise.resolve(mojiSession);
  } else {
    return axios.get('https://www.mojidict.com/_nuxt/app/b3f87f7f.f1a5be3.js')
    .then((value) => {
      const match = regAppId.exec(value.data);
      if (match) {
        mojiSession._ApplicationId = match[1];
        mojiSession.error = '';
      } else {
        mojiSession.error = '找不到_ApplicationId，请检查网络连接。';
      }
      return mojiSession;
    })
    .catch((reason) => {
      mojiSession.error = reason;
      return mojiSession;
    })
  }
}

function getAccount() {
  return new Promise((resolve, reject) => {
    vscode.window.showInputBox({ placeHolder: '账号' })
      .then((v) => {
        resolve(v);
      },
      (reason) => {
        reject(reason);
      })
  })
};

export function mojiLogout() {
  mojiSession._SessionToken = ''; //TODO: real logout
}

export function mojiLogin() {
  const printer = (msg: any) => showChannelMsg(mojiChannel, msg);
  let promises = [];
  promises.push(getSession());
  promises.push(getAccount());
  Promise.all(promises)
    .then(values => {
      const session: MojiSession = values[0] as MojiSession;
      const account: string = values[1] as string;
      vscode.window.showInputBox({ placeHolder: '密码' })
        .then((v: string | undefined) => {
          if (!v) {
            return Promise.reject('请输入密码');
          }
          if (session.error) {
            return Promise.reject(session.error);
          }
          return axios.post('https://api.mojidict.com/parse/login', {
            ...session,
            username: account,
            password: v,
            _method: "GET"
          })
        }, (reason) => { printer(reason) })
        .then(({data}: any) => {
            if (data && data.sessionToken) {
              session._SessionToken = data.sessionToken;
              printer('已登录：' + data.name);
            } else {
              printer('登录失败，请检查用户名或密码');
            }
          },
          (reason) => { printer(reason) }
        );
    })
}