/*
 *大項目から小項目の絞り込み
 * Copyright (c) 2024 noz-23
 *  https://github.com/noz-23/
 *
 * Licensed under the MIT License
 * 
 * History
 *  2024/03/20 0.1.0 初版とりあえずバージョン
 */


jQuery.noConflict();

((PLUGIN_ID_)=>{
  'use strict';

  var ListDropDownBox =[]; // 作成するUI関係の管理
  var ListAppRecord =null; // 読み取ったレコードデータ


  // 設定パラメータ
  const ParameterAppNumber ='paramAppNumber';    // アプリ番号
  const ParameterFieldSpace='paramFieldSpace';   // スペースフィールド
  const ParameterFieldSet  ='paramFieldSet';     // 文字列フィールド
  const ParameterCountRow  ='paramCountRow';     // 行数フィールド

  const EVENTS=[
    'app.record.create.show', // 作成表示
    'app.record.edit.show',   // 編集表示
    //'app.record.index.show',  // 一覧表示
    'app.record.create.edit', // 作成表示
    'app.record.edit.edit',   // 編集表示
    //'app.record.index.edit',  // 一覧表示
    //'app.record.create.submit', // 作成表示
    //'app.record.edit.submit',   // 編集表示
    //'app.record.index.submit',  // 一覧表示
    //'app.record.detail.show', // 作成表示
  ];

  kintone.events.on(EVENTS, async (events_) => {
    //console.log('events_:%o',events_);
    // 設定の読み込み
    var config =kintone.plugin.app.getConfig(PLUGIN_ID_);
    //console.log('config:%o',config);
    // テキストからJSONへ変換
    var appNo=config[ParameterAppNumber];
    makeDropDown(config);

    // KintoneRestAPIClientの呼び出し
    const client = new KintoneRestAPIClient();
    // レコードデータの取得
    const paramGet = {
      app: appNo   // アプリ番号
    };
    // kintone レコード取得
    ListAppRecord = await client.record.getAllRecords( paramGet);
    //console.log("ListAppRecord:%o",ListAppRecord);
    setDropDownItem();

    // 非表示・無効化
    var listSet =JSON.parse(config_[ParameterFieldSet]);
    for(var field of listSet){
      events_.record[field].disabled =true;
    }
     
    return events_;
  });

  const makeDropDown =( config_)=>{

    var count =(config_[ParameterCountRow]) ?Number(config_[ParameterCountRow]):(0);
    //console.log('count:%o',count);
    var listSpace =JSON.parse(config_[ParameterFieldSpace]);
    //console.log('listSpace:%o',listSpace);
    var listSet =JSON.parse(config_[ParameterFieldSet]);
    //console.log('listSet:%o',listSet);

    for(var i =0; i<count;i++)
    {
      //var label =new kintoneUIComponent.Label({text: listSet[i]});
      //var drop =new kintoneUIComponent.Dropdown({items: []});

      var drop =new Kuc.Dropdown(
        {
          label:listSet[i],
          requiredIcon:false,
          items:[],
          visible: true,
          disabled: false,          
        });

      ListDropDownBox.push({Column:listSet[i], Drop:drop});

      drop.addEventListener('change', async (e_) =>{
        // 値変更時の処理
        var item =ListDropDownBox.find( (find_) =>{ return find_.Drop ==drop});
        //console.log('select:%o',select);
        setDropDownItem();

        var record =await kintone.app.record.get();
        record.record[item.Column].value =item.Drop.value;
        kintone.app.record.set(record);
      });
      //kintone.app.record.getSpaceElement(listSpace[i]).appendChild(label.render());
      var space =kintone.app.record.getSpaceElement(listSpace[i]);
      //console.log('space:%o',space);
      space.appendChild(drop);
    }
  };

  const setDropDownItem =()=>{
    //console.log('ListDropDownBox:%o',ListDropDownBox);
    //console.log('ListAppRecord:%o',ListAppRecord);

    for( var item of ListDropDownBox)
    {
      //console.log('item:%o',item);
      if(item.Drop.value != '' && item.Drop.value !==undefined)
      {
        // 値が空以外(セット済み)の場合は、処理しない
        continue;
      }
      var list =[''];
      for(var record of ListAppRecord){
        if( compareRecord(record) ==true)
        {
          // 呼び出し項目が一致しない場合は、追加しない
          continue;
        }
        //console.log('record:%o',record);
        var add =record[item.Column].value;
        //console.log('add:%o',add);
        list.push(add);
      }
      //console.log('list:%o',list);

      // 重複削除
      var newList =Array.from(new Set(list));
      //console.log('newList:%o',newList);

      // リスト更新
      item.Drop.items =[];
      for(var data of newList){
        item.Drop.items.push({label:data,value:data})
      }
    }
  }

  const compareRecord=( record_)=>{
    var flg =false;
    for(var item of ListDropDownBox){
      if( item.Drop.value ===undefined)
      {
        // 値が空
        continue;
      }
      if( item.Drop.value =='')
      {
        // 値が空
        continue;
      }
      if(record_[item.Column].value ==item.Drop.value)
      {
        // レコードデータのカラムとコンボボックスの値が同じ
        continue;
      }

      flg =true;
    }
    return flg;
  }

  /*
  スリープ関数
   引数　：ms_ ms単位のスリープ時間
   戻り値：なし
  */
  const Sleep=(ms_)=>{
    return new Promise(resolve_ => setTimeout(resolve_, ms_));
  };
  
})(kintone.$PLUGIN_ID);
