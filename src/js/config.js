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

(async ( jQuery_,PLUGIN_ID_)=>{
  'use strict';

  const self =this;

  // 設定パラメータ
  const ParameterAppNumber ='paramAppNumber';    //  アプリ番号
  const ParameterFieldSpace='paramFieldSpace';    // 計算フィールド
  const ParameterFieldSet  ='paramFieldSet';        // 日付フィールド

  // 環境設定
  const Parameter = {
  // 表示文字
    Lang:{
      en:{
        plugin_titile      : 'Narrow Down Minor items from Major Items Plug-in',
        plugin_description : 'Create a drop-down to narrow down Minor items with Major items that are set up in a separate app',
        plugin_label       : 'Major items are prioritized from the top, minor items are prioritized from the bottom',
        app_label          : 'Load App No.       ',
        space_label        : 'Space Field        ',
        set_label          : 'Single Line Field  ',
        plugin_cancel      : 'Cancel',
        plugin_ok          : ' Save ',
      },
      ja:{
        plugin_titile      : '大項目から小項目の絞り込み プラグイン',
        plugin_description : '別アプリで設定している大項目を持つ小項目の絞り込みをするドロップダウンを作成します',
        app_label          : '読み込むアプリ番号 ',
        plugin_label       : '上から大項目、下が小項目の優先順位です',
        space_label        : 'スペース フィールド',
        set_label          : '文字列 フィールド  ',
        plugin_cancel      : 'キャンセル',
        plugin_ok          : '   保存  ',
      },
      DefaultSetting:'ja',
      UseLang:{}
    },
    Html:{
      Form               : '#plugin_setting_form',
      Title              : '#plugin_titile',
      Description        : '#plugin_description',
      Label              : '#plugin_label',
      SpaceLabel         : '#space_label',
      SetLabel           : '#set_label',
      TableBody          : '#table_body',
      AddRow             : '.add_row',
      RemoveRow          : '.remove_row',
      Cancel             : '#plugin_cancel',
      Ok                 : '#plugin_ok',
    },
    Elements:{
      AppNumber          :'#app_number',
      SpaceField         :'#space_field',
      SetField           :'#set_field',
    },
  };
  
 
  /*
  HTMLタグの削除
   引数　：htmlstr タグ(<>)を含んだ文字列
   戻り値：タグを含まない文字列
  */
  const escapeHtml =(htmlstr)=>{
    return htmlstr.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/'/g, '&quot;').replace(/'/g, '&#39;');
  };  

  /*
  ユーザーの言語設定の読み込み
   引数　：なし
   戻り値：なし
  */
  const settingLang=()=>{
    // 言語設定の取得
    Parameter.Lang.UseLang = kintone.getLoginUser().language;
    switch( Parameter.Lang.UseLang)
    {
      case 'en':
      case 'ja':
        break;
      default:
        Parameter.Lang.UseLang =Parameter.Lang.DefaultSetting;
        break;
    }
    // 言語表示の変更
    var html = jQuery(Parameter.Html.Form).html();
    var tmpl = jQuery.templates(html);
    
    var useLanguage =Parameter.Lang[Parameter.Lang.UseLang];
    // 置き換え
    jQuery(Parameter.Html.Form).html(tmpl.render({lang:useLanguage})).show();
  };

  /*
  フィールド設定
   引数　：なし
   戻り値：なし
  */
  const settingHtml= async ()=>{
    var listFeild =await kintone.api(kintone.api.url('/k/v1/app/form/fields', true), 'GET', {'app': kintone.app.getId()});
    console.log("listFeild:%o",listFeild);
    for (const key in listFeild.properties){
      //console.log("properties key:%o",key);
      try {
        const prop = listFeild.properties[key];
        //console.log("prop:%o",prop);
            // 日付フィールドのみ入れる
        if (prop.type === 'SINGLE_LINE_TEXT'){
          const option = jQuery('<option/>');
          option.attr('value', escapeHtml(prop.code)).text(escapeHtml(prop.label));

          console.log("Add SINGLE_LINE_TEXT option:%o",option);
          jQuery(Parameter.Elements.SetField).append(option);
        }
                 
      }
      catch (error) {
        console.log("error:%o",error);
      }
    }

    var listLayout =await kintone.api(kintone.api.url('/k/v1/app/form/layout.json', true), 'GET', {'app': kintone.app.getId()});
    for( var row of listLayout.layout){
      for(var field of row.fields){
        if (field.type === 'SPACER'){
          const option = jQuery('<option/>');
          option.attr('value', escapeHtml(field.elementId)).text(escapeHtml(field.elementId));
          console.log("Add SPACER option:%o",option);
          jQuery(Parameter.Elements.SpaceField).append(option);
        }
      }
    }
    // 現在データの呼び出し
    var nowConfig =kintone.plugin.app.getConfig(PLUGIN_ID_);
    console.log("nowConfig:%o",nowConfig);

    // 現在データの表示
    if(nowConfig[ParameterAppNumber]){
      jQuery(Parameter.Elements.AppNumber).val(nowConfig[ParameterAppNumber]); 
    }
    //if(nowConfig[ParameterFieldDate]){
    //  jQuery(Parameter.Elements.SetField).val(nowConfig[]); 
    //}
  };

  /*
  データの保存
   引数　：なし
   戻り値：なし
  */
   const saveSetting=()=>{
    // 各パラメータの保存
    var config ={};
    config[ParameterAppNumber]=jQuery(Parameter.Elements.AppNumber).val();
    config[ParameterFieldSpace]=[];
    config[ParameterFieldSet]=[];

    var listTr = jQuery(Parameter.Html.TableBody+' > tr');

    for(var row of listTr)
    {
      console.log("row:%o",row);

      var space=jQuery(row).find(Parameter.Elements.SpaceField);
      console.log("space:%o",space);
      config[ParameterFieldSpace].push(space.val());
      
      var set=jQuery(row).find(Parameter.Elements.SetField);
      console.log("set:%o",set);
      config[ParameterFieldSet].push(set.val());
    }
    //config[ParameterFieldDate]=jQuery(Parameter.Elements.DateField).val();

    console.log('config:%o',config);

    // 設定の保存
    kintone.plugin.app.setConfig(config);
  };

  function AddRow(){
    // ラムダのthisは全体になりボタンでなくなる
    console.log("AddRow this:%o",this);
    ////console.log("AddRow self:%o",self);
    //var listTr =jQuery(Parameter.Html.TableBody+' > tr');
    //console.log("AddRow listTr:%o",listTr);
    //var cloneTr =listTr.eq(0).clone(true);
    //console.log("AddRow cloneTr:%o",cloneTr);
    ////var endTr=tr.eq(-1);
    ////console.log("AddRow endTr:%o",endTr);

    ////var table =jQuery(Parameter.Html.TableBody);
    ////table.append(cloneTr);

    ////endTr.insertBefore(cloneTr);
    ////.insertAfter(jQuery(this).parent().parent());

    //cloneTr.insertAfter(jQuery(this).parent().parent());
    jQuery(Parameter.Html.TableBody+' > tr').eq(0).clone(true).insertAfter(jQuery(this).parent().parent());

  };

  function RemoveRow(){
    console.log("RemoveRow this:%o",this);
    //console.log("RemoveRow self:%o",self);
    jQuery(this).parent("td").parent("tr").remove();
  };

  // 言語設定
  settingLang();
  await settingHtml();

  // 保存
  jQuery(Parameter.Html.Ok).click(()=>{saveSetting();});
  // キャンセル
  jQuery(Parameter.Html.Cancel).click(()=>{history.back();});

  jQuery(Parameter.Html.AddRow).click(AddRow);
  jQuery(Parameter.Html.RemoveRow).click(RemoveRow);
})(jQuery, kintone.$PLUGIN_ID);