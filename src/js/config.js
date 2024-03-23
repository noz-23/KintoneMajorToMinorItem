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

(async ( jQuery_,PLUGIN_ID_)=>{
  'use strict';

  // 設定パラメータ
  const ParameterFieldCalculate='paramFieldCalculate';    // 計算フィールド
  const ParameterFieldDate     ='paramFieldDate';        // 日付フィールド

  // 環境設定
  const Parameter = {
  // 表示文字
    Lang:{
      en:{
        plugin_titile      : 'Associate Calculated With Date Fields Plugin',
        plugin_description : 'Sets the result of a calculation in a calculated field to a date field',
        plugin_label       : 'Please Setting Calculate and Date Field',
        calc_label         : 'Calculate Field ',
        date_label         : 'Date Field      ',
        plugin_cancel      : 'Cancel',
        plugin_ok          : ' Save ',
        alert_message      : 'Please don\'t same fields Organizations and Primary'
      },
      ja:{
        plugin_titile      : '計算フィールドと日付フィールドの関連付け プラグイン',
        plugin_description : '計算フィールドで計算した結果を日付フィールドに設定します',
        plugin_label       : '計算フィールドと日付フィールドを設定して下さい',
        calc_label         : '計算 フィールド',
        date_label         : '日付 フィールド',
        plugin_cancel      : 'キャンセル',
        plugin_ok          : '   保存  ',
        alert_message      : '所属組織と優先組織は同じにしないで下さい'
      },
      DefaultSetting:'ja',
      UseLang:{}
    },
    Html:{
      Form               : '#plugin_setting_form',
      Title              : '#plugin_titile',
      Description        : '#plugin_description',
      Label              : '#plugin_label',
      CalcLabel          : '#calc_label',
      DateLabel          : '#date_label',
      Cancel             : '#plugin_cancel',
      Ok                 : '#plugin_ok',
    },
    Elements:{
      CalcField         :'#calc_field',
      DateField         :'#date_field',
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
    
        // 計算フィールドのみ入れる
        if (prop.type === 'CALC'){
          const option = jQuery('<option/>');
          option.attr('value', escapeHtml(prop.code)).text(escapeHtml(prop.label));
          console.log("Add CALC option:%o",option);
          jQuery(Parameter.Elements.CalcField).append(option);
        }
        // 日付フィールドのみ入れる
        if (prop.type === 'DATE'){
          const option = jQuery('<option/>');
          option.attr('value', escapeHtml(prop.code)).text(escapeHtml(prop.label));

          console.log("Add DATE option:%o",option);
          jQuery(Parameter.Elements.DateField).append(option);
        }
                 
      }
      catch (error) {
        console.log("error:%o",error);
      }

      // 現在データの呼び出し
      var nowConfig =kintone.plugin.app.getConfig(PLUGIN_ID_);
      console.log("nowConfig:%o",nowConfig);

      // 現在データの表示
      if(nowConfig[ParameterFieldCalculate]){
        jQuery(Parameter.Elements.CalcField).val(nowConfig[ParameterFieldCalculate]); 
      }
      if(nowConfig[ParameterFieldDate]){
        jQuery(Parameter.Elements.DateField).val(nowConfig[ParameterFieldDate]); 
      }
    }
  };

  /*
  データの保存
   引数　：なし
   戻り値：なし
  */
   const saveSetting=()=>{
    // 各パラメータの保存
    var config ={};
    config[ParameterFieldCalculate]=jQuery(Parameter.Elements.CalcField).val();
    config[ParameterFieldDate]=jQuery(Parameter.Elements.DateField).val();

    console.log('config:%o',config);

    // 設定の保存
    kintone.plugin.app.setConfig(config);
  };

  // 言語設定
  settingLang();
  await settingHtml();

  // 保存
  jQuery(Parameter.Html.Ok).click(() =>{saveSetting();});
  // キャンセル
  jQuery(Parameter.Html.Cancel).click(()=>{history.back();});
})(jQuery, kintone.$PLUGIN_ID);
