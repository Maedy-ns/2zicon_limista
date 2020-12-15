function doGet(e) { //アクセスされた時に呼ばれる
  const html = HtmlService.createTemplateFromFile('index');
  html.tabledata = createTableData();
  const output = html.evaluate().addMetaTag('viewport', 'width=device-width, initial-scale=1.0').setTitle("虹コン リミスタサイン会");
            //.setFaviconUrl('https://drive.google.com/uc?id=1YwMIEtg5aIRHXkm9RHwZwzNT61LmklL8&.png');
  return output;
}

//データスプレッドシート
const LogSheet = SpreadsheetApp.openById('1rWVSDIT7dk1qO5Kw9z6BaXWXDmKzsfiSLrSwrsQjjVg');
const Sheets = LogSheet.getSheets();
const DataSheet = Sheets[0];
const SiteAccessSheet = Sheets[1];
const UserAgentSheet = Sheets[2];
const YoutubeAccessSheet = Sheets[3];
const YoutubeUASheet = Sheets[4];
//スプレッドシートのURL
//https://docs.google.com/spreadsheets/d/1rWVSDIT7dk1qO5Kw9z6BaXWXDmKzsfiSLrSwrsQjjVg/edit?usp=sharing

const memberName = ["中村","清水","的場","山本","根本","岡田","大和","山崎","隈本","片岡","鶴見","蛭田"];

//table作成
function createTableData() {
    var tablehtml = "";
  try {
    const columnAVals = DataSheet.getRange('A:A').getValues(); //データ追加中のアクセスに備えてA列のみで判定する（A列を最後に入力する)
    const lastRow = columnAVals.filter(String).length;
    var tabledata = DataSheet.getRange(2, 1, lastRow-1, 18).getValues();
    Logger.log(tabledata);
    tabledata.forEach(function (trdata) {
      var tr = "<tr>";
      if (trdata[4]) {
        tr += '<th data-img="'+ trdata[1] + '" data-title ="'+ trdata[2] + '"><a data-href="' + trdata[3] + '" target="_blank">' + trdata[0] +'<br class="br-sp"><span class="time-sp">' + trdata[4] + '</span><span class="time-pc">(' + trdata[5] + '~)</span></a></th>';
      } else {
        tr += '<th data-img="'+ trdata[1] + '" data-title ="'+ trdata[2] + '"><a data-href="' + trdata[3] + '" target="_blank">' + trdata[0] + '</a></th>';
      }
      for (var i = 6; i <= 17; i++) {
        tr += "<td>" + trdata[i] + "</td>";
      }
      tr += "</tr>";
      tablehtml += tr;
    });
  }
  catch (error) {
    tablehtml = '<tr> <td　colspan="13">データが取得できませんでした。</td> </tr>';
    
  }
  finally {
    return tablehtml;
  }
}


function addSiteAccess(ua,w,h,param) {
  if(param["user"] == "myself") { return; } //自分からのアクセスはログに記録しない
  
  //今日のアクセス数更新
  var last = SiteAccessSheet.getLastRow();
  var date = new Date();
  var today = Utilities.formatDate(date,"JST", "YYYY/MM/dd");
  var date_T = Utilities.formatDate(date, 'JST', 'HH:mm:ss');
  var textFinder = SiteAccessSheet.createTextFinder(today);
  var range = textFinder.findNext();
  if(range == null) {
    SiteAccessSheet.getRange(last+1,1,1,3).setValues([[today,0,0]]);
    range = textFinder.findNext();
  }
  var row = range.getRow();
  var todayvalue = SiteAccessSheet.getRange(row,2).getValue();
  SiteAccessSheet.getRange(row,2).setValue(todayvalue + 1);
  
  //ユーザーエージェントを記録
  var ScreenSize = w+"×"+h;
  var UAlast = UserAgentSheet.getLastRow();
  for (var i = 0; i <= UAlast-2;i++) {
    var cell = UserAgentSheet.getRange(UAlast-i,1);
    var lastday = cell.getValue();
    if (cell.isBlank()==false) {
      lastday = Utilities.formatDate(lastday,"JST", "YYYY/MM/dd");
      break;
    }
  }
  if(lastday == today) {
    today = null;
  }
  var d = [[today,date_T,ua,ScreenSize]];
  UserAgentSheet.getRange(UAlast+1,1,1,4).setValues(d);
}

//クリックされたYouTubeリンクを記録
function addYoutubeAccess(date,array,ua,param){
  if(param["user"] == "myself") { return; } //自分からのアクセスはログに記録しない
  
  //アクセスカウンター
  //今日のクリック数記録
  var newdate = new Date();
  var today = Utilities.formatDate(newdate,"JST", "YYYY/MM/dd");
  var textFindery = SiteAccessSheet.createTextFinder(today);
  var rangey = textFindery.findNext();
  var rowy = rangey.getRow();
  var todayvalue = SiteAccessSheet.getRange(rowy,3).getValue();
  SiteAccessSheet.getRange(rowy,3).setValue(todayvalue + 1);
  
  //YouTubeカウンター
  //実施回記録
  var textFinder = YoutubeAccessSheet.createTextFinder(date);
  var range = textFinder.findNext();
  if(range) {
    var row = range.getRow();
    var value = YoutubeAccessSheet.getRange(row,2).getValue();
    YoutubeAccessSheet.getRange(row,2).setValue(value+1);
  }
  else {
    var d = [[date,"1"]];
    var last = YoutubeAccessSheet.getLastRow();
    YoutubeAccessSheet.getRange(last+1,1,1,2).setValues(d);
  }
  
  //メンバーごとの回数記録
  var membervalues = YoutubeAccessSheet.getRange("E2:E13").getValues();
  for (var i = 0; i <= array.length-1 ; i++) {
    var r = array[i];
    membervalues[r][0] += 1;
  }
  YoutubeAccessSheet.getRange("E2:E13").setValues(membervalues);
  
  //YouTubeUA
  //出演メンバー
  var memberlist = [];
  for (var i = 0;i <= array.length-1; i++) {
    memberlist.push(memberName[array[i]]);
  }
  var member = memberlist.join();
  
  //UA記録
  var YUAlast = YoutubeUASheet.getLastRow();
  for (var i = 0; i <= YUAlast-2;i++) {
    var cell = YoutubeUASheet.getRange(YUAlast-i,1);
    var lastday = cell.getValue();
    if (cell.isBlank()==false) {
      lastday = Utilities.formatDate(lastday,"JST", "YYYY/MM/dd");
      break;
    }
  }
  var dates = new Date();
  var today = Utilities.formatDate(dates,"JST", "YYYY/MM/dd");
  var date_T = Utilities.formatDate(dates, 'JST', 'HH:mm');
  if(lastday == today) {
    today = null;
  }
  var d = [[today,date_T,date,ua,member]];
  YoutubeUASheet.getRange(YUAlast+1,1,1,5).setValues(d);
}

//アクセスがあった日には通知を送る
function notice() {
  var date = new Date();
  var today = Utilities.formatDate(date,"JST", "YYYY/MM/dd");
  var textFinder = SiteAccessSheet.createTextFinder(today);
  var range = textFinder.findNext();
  if(range == null) {
    return;
  }
  var row = range.getRow();
  var todayaccess = SiteAccessSheet.getRange(row,2,1,2).getValues();
  if (todayaccess[0][0] > 0 || todayaccess[0][1] > 0) {
    const recipient = PropertiesService.getScriptProperties().getProperty("MailAddress");
    const subject = "虹コン リミスタサイン会";
    var body = "今日は " + todayaccess[0][0] + " 件のサイトアクセスと、 " + todayaccess[0][1] + " 件のYouTubeアクセスがありました。　確認する https://docs.google.com/spreadsheets/d/1rWVSDIT7dk1qO5Kw9z6BaXWXDmKzsfiSLrSwrsQjjVg/edit?usp=sharing"
    MailApp.sendEmail(recipient, subject, body)
  }
}
