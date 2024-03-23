/*
 *計算の日付関連付け
 * Copyright (c) 2024 noz-23
 *  https://github.com/noz-23/
 *
 * Licensed under the MIT License
 * 
 * History
 *  2024/03/12 0.1.0 初版とりあえずバージョン
 */


jQuery.noConflict();

((PLUGIN_ID_)=>{
  'use strict';

  // Kintone プラグイン 設定パラメータ
  const config = kintone.plugin.app.getConfig(PLUGIN_ID_);

  const readCalc =config['paramFieldCalculate'];   // 計算フィールド名
  const writeDate=config['paramFieldDate'];        // 日付フィールド名

  const EVENTS=[
    'app.record.create.show', // 作成表示
    'app.record.edit.show',   // 編集表示
    'app.record.index.show',  // 一覧表示
    'app.record.create.edit', // 作成表示
    'app.record.edit.edit',   // 編集表示
    'app.record.index.edit',  // 一覧表示
    'app.record.create.submit', // 作成表示
    'app.record.edit.submit',   // 編集表示
    'app.record.index.submit',  // 一覧表示
    'app.record.detail.show', // 作成表示
  ];

  kintone.events.on(EVENTS, async (events_) => {
    console.log('events_:%o',events_);
    events_.record[writeDate].disabled =true;
	  events_.record[writeDate].value =events_.record[readCalc].value;
    return events_;
  });

  /*
  スリープ関数
   引数　：ms_ ms単位のスリープ時間
   戻り値：なし
  */
  const Sleep=(ms_)=>{
    return new Promise(resolve_ => setTimeout(resolve_, ms_));
  };
  
})(kintone.$PLUGIN_ID);
