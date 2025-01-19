function checkSchedules() {
  const source = SpreadsheetApp.openById(
    "1H1dQui5lKC7sz0dnLMB_h5wl5Y82yiB8US4q4dyb-ZI"
  );
  const sourceSheet = source.getSheetByName("Schedules");

  var currTime = new Date();
  var hour = currTime.getHours();
  hour = hour < 10 ? "0" + hour.toString() : hour; //convert single digit hour to double
  var min = currTime.getMinutes();
  var currTimeString = hour + min.toString();

  var toSendTo = getChatIdsWithCurrTime(currTimeString, sourceSheet);

  for (var content of toSendTo) {
    var blocks = content["blocks"].split(",");
    viewBlocks(content["chatId"], blocks);
    // for(var block of blocks) {
    //   viewBlock(content["chatId"], block);
    // }
  }
}

function getChatIdsWithCurrTime(currTimeString, sourceSheet) {
  var scheduledTimes = sourceSheet.getRange("C:C").getValues();
  var toSend = [];
  var row = 0;
  for (var time of scheduledTimes) {
    row++;
    time = time[0];
    if (time === "") {
      return toSend;
    } else if (time.toString() === currTimeString) {
      var chatId = sourceSheet.getRange("B" + row.toString()).getValue();
      var blocks = sourceSheet.getRange("D" + row.toString()).getValue();
      toSend.push({ chatId: chatId, blocks: blocks });
    }
  }
  return toSend;
}

function addScheduledMessage(chatId, setScheduledTiming, blocks) {
  const source = SpreadsheetApp.openById(
    "1H1dQui5lKC7sz0dnLMB_h5wl5Y82yiB8US4q4dyb-ZI"
  );
  const sourceSheet = source.getSheetByName("Schedules");
  var scheduledTiming = checkScheduledMessageForChatItExists(
    chatId,
    sourceSheet
  );

  //check if schedule exists
  if (scheduledTiming !== false) {
    sendMessage(
      chatId,
      "Scheduled message exists at timing: " +
        "<u><b>" +
        scheduledTiming +
        "</b></u>" +
        "\n\n" +
        "/unschedule before scheduling new timing."
    );
    return false;
  } else {
    var ids = sourceSheet.getRange("A:A");
    var nextId = 0;
    while (ids.getValues()[nextId][0] != "") {
      nextId++;
    }
    nextId++;

    var range = sourceSheet.getRange(
      "A" + nextId.toString() + ":D" + nextId.toString()
    );

    range.setValues([[nextId - 1, chatId, "'" + setScheduledTiming, blocks]]);

    return true;
  }
}

function processScheduleCommand(scheduleRequestMessage, chatId) {
  var regex =
    /^\/schedule\s(([0-1][\d][0-5][\d])|([2][0-3][0-5][\d]))\s((?!.*(7a){2,}|.*(7b){2,}|.*(7c){2,})(7a(,|$)\s*|7b(,|$)\s*|7c(,|$)\s*){1,3})(?<!,)$/;

  if (regex.test(scheduleRequestMessage)) {
    var matchedString = scheduleRequestMessage.match(regex);
    var time = matchedString[1];
    var blocks = matchedString[4].replace(" ", "");

    var scheduleSuccess = addScheduledMessage(chatId, time, blocks);
    if (scheduleSuccess) {
      sendMessage(
        chatId,
        "Updates scheduled for blocks <b><u>" +
          blocks +
          "</u></b> at time <b><u>" +
          time +
          "</u></b> successful!"
      );
    }
  } else {
    sendMessage(
      chatId,
      "Scheduling failed. Check that schedule format provided is correct: \n\n/schedule [HHmm] [blocks separated by ,] \ne.g. /schedule 0930 7a,7c,7b \n\n1. Time is within 0000-2359\n\n2. Blocks are separated by ',' and does not contain ',' at the end. \nCorrect: 7a,7b,7c \nIncorrect: 7a,7b,7c,"
    );
  }
}

function processRescheduleCommand(scheduleRequestMessage, chatId) {
  var regex =
    /^\/reschedule\s(([0-1][\d][0-5][\d])|([2][0-3][0-5][\d]))\s((?!.*(7a){2,}|.*(7b){2,}|.*(7c){2,})(7a(,|$)\s*|7b(,|$)\s*|7c(,|$)\s*){1,3})(?<!,)$/;

  if (regex.test(scheduleRequestMessage)) {
    var matchedString = scheduleRequestMessage.match(regex);
    var time = matchedString[1];
    var blocks = matchedString[4].replace(" ", "");

    var rescheduleStatus = reschedule(chatId, time, blocks);

    if (rescheduleStatus) {
      sendMessage(
        chatId,
        "Updates scheduled for blocks <b><u>" +
          blocks +
          "</u></b> at time <b><u>" +
          time +
          "</u></b> successful!"
      );
    }
  } else {
    sendMessage(
      chatId,
      "Rescheduling failed. Check that reschedule format provided is correct: \n\n/reschedule [HHmm] [blocks separated by ,] \ne.g. /reschedule 0930 7a,7c,7b \n\n1. Time is within 0000-2359\n\n2. Blocks are separated by ',' and does not contain ',' at the end. \nCorrect: 7a,7b,7c \nIncorrect: 7a,7b,7c,"
    );
  }
}

function unschedule(chatId) {
  var source = SpreadsheetApp.openById(
    "1H1dQui5lKC7sz0dnLMB_h5wl5Y82yiB8US4q4dyb-ZI"
  );
  var sourceSheet = source.getSheetByName("Schedules");
  var existingChatIds = sourceSheet.getRange("B:B").getValues();
  var row = 0;
  var startRow = 0;
  for (var existingChatId of existingChatIds) {
    row++;
    if (existingChatId[0].toString() === chatId.toString()) {
      startRow = row;
    } else if (existingChatId[0] === "" && startRow != 0) {
      endRow = row;
    } else if (existingChatId[0] === "" && startRow === 0) {
      return sendMessage(chatId, "Schedule does not exist.");
    }
  }
  console.log(startRow + 1 + " " + endRow + 1);
  var copy = sourceSheet
    .getRange((startRow + 1).toString() + ":" + (endRow + 1).toString())
    .getValues();
  console.log(startRow - 1 + " " + endRow - 1);
  sourceSheet
    .getRange(startRow.toString() + ":" + endRow.toString())
    .setValues(copy);
}

function reschedule(chatId, time, blocks) {
  var source = SpreadsheetApp.openById(
    "1H1dQui5lKC7sz0dnLMB_h5wl5Y82yiB8US4q4dyb-ZI"
  );
  var sourceSheet = source.getSheetByName("Schedules");
  var existingChatIds = sourceSheet.getRange("B:B").getValues();
  var row = 0;

  for (var existingChatId of existingChatIds) {
    row++;
    if (existingChatId[0].toString() === chatId.toString()) {
      var valuesToChangeTo = [[row - 1, chatId, "'" + time, blocks]];
      sourceSheet
        .getRange("A" + row + ":" + "D" + row)
        .setValues(valuesToChangeTo);
      return true;
    } else if (existingChatId[0] === "") {
      return false;
    }
  }
  sendMessage(
    chatId,
    "Schedule does not exist. Try making a schedule with /schedule"
  );
  return false;
}

function checkScheduledMessageForChatItExists(chatId, sourceSheet) {
  var existingChatIds = sourceSheet.getRange("B:B").getValues();
  var row = 0;
  for (var existingChatId of existingChatIds) {
    row++;
    if (existingChatId[0].toString() === chatId.toString()) {
      var scheduledTiming = sourceSheet
        .getRange("C" + row.toString())
        .getValue();
      return scheduledTiming;
    } else if (existingChatId[0] === "") {
      return false;
    }
  }
  return false;
}
