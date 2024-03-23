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
  const ParameterShow      ='paramShow';         // フィールドの表示
  const ParameterCountRow  ='paramCountRow';     // 行数フィールド
  const ParameterListRow   ='paramListRow';      // 行のデータ(JSON->テキスト)

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
    console.log('config:%o',config);
    // テキストからJSONへ変換
    var appNo=config[ParameterAppNumber];
    makeDropDown(config,events_);

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

    return events_;
  });

  const makeDropDown =( config_ ,events_)=>{

    var show =config_[ParameterShow]; 
    var count =(config_[ParameterCountRow]) ?Number(config_[ParameterCountRow]):(0);
    var listRow =JSON.parse(config_[ParameterListRow]);
    console.log('listRow:%o',listRow);

    for(var i =0; i<count;i++)
    {
      var row =listRow[i];
      //
      var drop =new Kuc.Dropdown(
        {
          label:row.Set,
          requiredIcon:false,
          items:[],
          visible: true,
          disabled: false,          
        });

      ListDropDownBox.push({Column:row.Set, Drop:drop});

      drop.addEventListener('change', async (e_) =>{
        //console.log('e_:%o',e_);
        // 値変更時の処理
        var changeItem =ListDropDownBox.find( (find_) =>{ return find_.Drop ==e_.target});
        console.log('changeItem:%o',changeItem);

        var record =await kintone.app.record.get();
        record.record[changeItem.Column].value =changeItem.Drop.value;
        //
        //console.log('record:%o',record);
        var flg =false;
        for( var item of ListDropDownBox){
          if( changeItem.Column ==item.Column){
            flg =true;
            continue;
          }
          if(flg ==true){
            item.Drop.value='';
            record.record[item.Column].value ='';
          }
        }

        kintone.app.record.set(record);
        setDropDownItem();
      });

      var space =kintone.app.record.getSpaceElement(row.Space);
      space.appendChild(drop);

      // 非表示・無効化
      switch(show){
        default:
        case 'Disabled':
          events_.record[row.Set].disabled =true;
          break;
        case 'NoVisable':
          events_.record[row.Set].visible =false;
          break;
        case 'Visable':
          break;
      }
    }
  };

  const setDropDownItem =()=>{
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
      console.log('newList:%o',newList);

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
