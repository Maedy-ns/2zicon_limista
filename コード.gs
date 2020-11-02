function doGet(e) { //アクセスされた時に呼ばれる
  const htmloutput = HtmlService.createTemplateFromFile('index')
      .evaluate()
      .addMetaTag('viewport', 'width=device-width, initial-scale=1.0')
      .setTitle("虹コン リミスタサイン会");
            //.setFaviconUrl('https://drive.google.com/uc?id=1YwMIEtg5aIRHXkm9RHwZwzNT61LmklL8&.png');
  return htmloutput;
}

//アクセスログスプレッドシート
const LogSheet = SpreadsheetApp.openById('1rWVSDIT7dk1qO5Kw9z6BaXWXDmKzsfiSLrSwrsQjjVg');
const Sheets = LogSheet.getSheets();
const SiteAccessSheet = Sheets[0];
const UserAgentSheet = Sheets[1];
const YoutubeAccessSheet = Sheets[2];
const YoutubeUASheet = Sheets[3];
//スプレッドシートのURL
//https://docs.google.com/spreadsheets/d/1rWVSDIT7dk1qO5Kw9z6BaXWXDmKzsfiSLrSwrsQjjVg/edit?usp=sharing

const memberName = ["中村","清水","的場","山本","根本","岡田","大和","山崎","隈本","片岡","鶴見","蛭田"];

//翌日の日付を入力する
//GASのトリガー機能で毎日０時に実行されるように設定
function setDate() {
  var last = SiteAccessSheet.getLastRow();
  var tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow = Utilities.formatDate(tomorrow,"JST", "YYYY/MM/dd");
  SiteAccessSheet.getRange(last+1,1,1,3).setValues([[tomorrow,0,0]]);
}

function addSiteAccess(ua,w,h,param) {
  if(param["myself"] == "true") { return; }
  
  //累計アクセス数更新
  var totalvalue = SiteAccessSheet.getRange("D2").getValue();
  SiteAccessSheet.getRange("D2").setValue(totalvalue+1);
  
  //今日のアクセス数更新
  var last = SiteAccessSheet.getLastRow();
  var date = new Date();
  var today = Utilities.formatDate(date,"JST", "YYYY/MM/dd");
  var date_T = Utilities.formatDate(date, 'JST', 'HH:mm:ss');
  var textFinder = SiteAccessSheet.createTextFinder(today);
  var range = textFinder.findNext();
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
  if(param["myself"] == "true") { return; }
  
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

function notice() {
  var date = new Date();
  var today = Utilities.formatDate(date,"JST", "YYYY/MM/dd");
  var textFinder = SiteAccessSheet.createTextFinder(today);
  var range = textFinder.findNext();
  var row = range.getRow();
  var todayaccess = SiteAccessSheet.getRange(row,2,1,2).getValues();
  if (todayaccess[0][0] > 0) {
    var body = "今日は " + todayaccess[0][0] + " 件のアクセスと、 " + todayaccess[0][1] + " 件のYouTubeのクリックがありました。　確認する https://docs.google.com/spreadsheets/d/1rWVSDIT7dk1qO5Kw9z6BaXWXDmKzsfiSLrSwrsQjjVg/edit?usp=sharing"
    MailApp.sendEmail("wwnb9696@gmail.com", "虹コンリミスタサイン会", body)
  }
}