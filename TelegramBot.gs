function doGet(e) {
  return HtmlService.createHtmlOutput("Hello, world!");
}

function doPost(e) {
  var data = JSON.parse(e.postData.contents);
  var chatId = data.message.chat.id;
  var text = data.message.text;
  var username = data.message.from.username;

  if (text == "/start") {
    var firstName = data.message.from.first_name;
    var startMessage = "";
    startMessage +=
      "Hello " +
      (username === undefined || username === "" ? firstName : username) +
      "! Welcome to the <u>Kallang Horizon Update Bot</u>.\n\n" +
      "To start, we have the default update schedule timing to be at <b><u>6pm daily</u></b>. You can /unschedule and /reschedule as to your liking! \n\n" +
      "Here are some commands to get you started: \n" +
      "/start - begin service with bot\n" +
      "/7a - get availability for units in block 7a\n" +
      "/7b - get availability for units in block 7b\n" +
      "/7c - get availability for units in block 7c\n" +
      "/schedule [Timing in HHmm] [blocks separated by ,] - schedule daily updates e.g. /schedule 0830 7a,7b,7c\n" +
      "/reschedule [Timing in HHmm] [blocks separated by ,] - reschedule daily updates e.g. /reschedule 1030 7a,7b,7c\n" +
      "/unschedule - remove existing scheduled update (each user can only have one scheduled timing)\n" +
      "/about - brief description of bot\n" +
      "/summary - get summary availability of Kallang Horizon BTO (BETA)";
    var saved = saveUserData(data["message"]);
    if (saved) {
      addScheduledMessage(chatId, "1800", "7a,7b,7c");
    }
    sendMessage(chatId, startMessage);
  } else if (text == "/help") {
    var message = "";
    message +=
      "/start - begin service with bot\n" +
      "/summary - get summary availability of Kallang Horizon BTO\n" +
      "/7a - get availability for units in block 7a\n" +
      "/7b - get availability for units in block 7b\n" +
      "/7c - get availability for units in block 7c\n" +
      "/schedule [Timing in HHmm] [blocks separated by ,] - schedule daily updates e.g. /schedule 0830 7a,7b,7c\n" +
      "/reschedule [Timing in HHmm] [blocks separated by ,] - reschedule daily updates e.g. /reschedule 1030 7a,7b,7c\n" +
      "/unschedule - remove existing scheduled update (each user can only have one scheduled timing)\n" +
      "/about - brief description of bot";
    sendMessage(chatId, message);
  } else if (text == "/summary") {
    sendSummary(chatId);
  } else if (text == "/7a") {
    viewBlocks(chatId, ["7a"]);
  } else if (text == "/7b") {
    viewBlocks(chatId, ["7b"]);
  } else if (text == "/7c") {
    viewBlocks(chatId, ["7c"]);
  } else if (text == "/about") {
    var message = "";
    message +=
      "This bot was created by @Zephyrino in hopes to help you busy folks get updates on the <b>Kallang Horizon</b> BTO on the go! It uses data from this google spreadsheet kindly created by @aaudaleeee: \n\nhttps://docs.google.com/spreadsheets/d/1kSRPCQnd_QbJYoc48M8h7nlZPj8raLq4bU0U4IqNrYo/edit#gid=629264458\n\n Do drop me a PM if you have any suggestions or questions regarding the development of the bot. Cheers!";
    sendMessage(chatId, message);
  } else if (text == "/unschedule") {
    unschedule(chatId);
    sendMessage(
      chatId,
      "Unscheduling Successful! You can now /schedule a new timing."
    );
  } else if (text.includes("/schedule")) {
    processScheduleCommand(text, chatId);
  } else if (text.includes("/reschedule")) {
    processRescheduleCommand(text, chatId);
  } else {
    var message = "Not a valid command, /help for the list of valid commands.";
    sendMessage(chatId, message);
  }
}

function sendMessage(id, text) {
  var token = "XXXXX"; // secret token provided by telegram
  var data = {
    method: "post",
    payload: {
      method: "sendMessage",
      chat_id: String(id),
      text: text,
      parse_mode: "HTML",
    },
    muteHttpExceptions: true,
  };
  UrlFetchApp.fetch("https://api.telegram.org/bot" + token + "/", data);
}
