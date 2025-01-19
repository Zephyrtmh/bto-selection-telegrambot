function sendSummary(id) {
  const source = SpreadsheetApp.openById(
    "1kSRPCQnd_QbJYoc48M8h7nlZPj8raLq4bU0U4IqNrYo"
  );
  const sourceSheet = source.getSheetByName("4 Room");

  //green #d9ead3 - available
  //grey #d9d9d9 - NA
  //red #f4cccc - taken

  var lastModified = sourceSheet.getRange("D42").getValue();

  blockColumns = [
    "B",
    "C",
    "D",
    "E",
    "H",
    "I",
    "J",
    "K",
    "L",
    "O",
    "P",
    "Q",
    "R",
    "S",
    "T",
  ];

  blockColumnsDict = {
    B: "102",
    C: "104",
    D: "108",
    E: "110",
    H: "112",
    I: "114",
    J: "116",
    K: "118",
    L: "120",
    O: "124",
    P: "126",
    Q: "128",
    R: "130",
    S: "132",
    T: "134",
  };

  var summary = new Object();
  var totalTaken = 0;
  var totalAvailable = 0;
  //blk
  for (var col of Object.keys(blockColumnsDict)) {
    const dict = new Object();
    const unitStats = new Object();
    dict["#d9ead3"] = 0;
    dict["#d9d9d9"] = 0;
    dict["#f4cccc"] = 0;
    var backgrounds = sourceSheet
      .getRange(col + "7:" + col + "35")
      .getBackgrounds();
    for (var background of backgrounds) {
      dict[background] = dict[background] + 1;
    }

    var available = dict["#d9ead3"];
    var na = dict["#d9d9d9"];
    var taken = dict["#f4cccc"];
    var total = available + taken;
    var unitNum = blockColumnsDict[col];

    unitStats["available"] = available;
    unitStats["taken"] = taken;
    unitStats["total"] = total;
    summary[unitNum] = unitStats;

    totalTaken += taken;
    totalAvailable += available;
  }

  var outputText = "";

  outputText = outputText + "Last Modified: " + lastModified + "\n\n";

  for (const [key, value] of Object.entries(summary)) {
    outputText =
      outputText +
      "Unit " +
      key +
      ": " +
      "\n" +
      "Available: " +
      value["available"] +
      "\n" +
      "Taken: " +
      value["taken"] +
      "\n" +
      "Total: " +
      value["total"] +
      "\n\n";
  }

  outputText =
    outputText +
    "Total Available: " +
    totalAvailable +
    "\n" +
    "Total Taken: " +
    totalTaken +
    "\n\n";

  outputText = outputText + "Last Modified: " + lastModified + "\n\n";

  outputText =
    outputText +
    "View Full Updates: \n https://docs.google.com/spreadsheets/d/1kSRPCQnd_QbJYoc48M8h7nlZPj8raLq4bU0U4IqNrYo/edit#gid=629264458";
  sendMessage(id, outputText);
}

function collectData() {
  const source = SpreadsheetApp.openById(
    "1kSRPCQnd_QbJYoc48M8h7nlZPj8raLq4bU0U4IqNrYo"
  );
  const sourceSheet = source.getSheetByName("4 Room");

  blockColumnsDict = {
    "7a": {
      102: { rowNo: "B", status: [] },
      104: { rowNo: "C", status: [] },
      108: { rowNo: "D", status: [] },
      110: { rowNo: "E", status: [] },
    },
    "7b": {
      112: { rowNo: "H", status: [] },
      114: { rowNo: "I", status: [] },
      116: { rowNo: "J", status: [] },
      118: { rowNo: "K", status: [] },
      120: { rowNo: "L", status: [] },
    },
    "7c": {
      124: { rowNo: "O", status: [] },
      126: { rowNo: "P", status: [] },
      128: { rowNo: "Q", status: [] },
      130: { rowNo: "R", status: [] },
      132: { rowNo: "S", status: [] },
      134: { rowNo: "T", status: [] },
    },
  };

  for (var block of Object.keys(blockColumnsDict)) {
    for (var unit of Object.keys(blockColumnsDict[block])) {
      var col = blockColumnsDict[block][unit]["rowNo"];
      const unitStats = new Object();
      var backgrounds = sourceSheet
        .getRange(col + "7:" + col + "35")
        .getBackgrounds();
      mappedBackgrounds = backgrounds.map(mapBackground);
      blockColumnsDict[block][unit]["status"] = mappedBackgrounds;
    }
  }
  return blockColumnsDict;
}

function mapBackground(background) {
  switch (background[0]) {
    case "#d9ead3":
      return "🟢";
    case "#d9d9d9":
      return "➖";
    case "#f4cccc":
      return "❌";
  }
}

function viewBlocks(id, blocks, unit) {
  const source = SpreadsheetApp.openById(
    "1kSRPCQnd_QbJYoc48M8h7nlZPj8raLq4bU0U4IqNrYo"
  );
  const sourceSheet = source.getSheetByName("4 Room");

  var lastModified = sourceSheet.getRange("D42").getValue();
  var data = collectData();
  var textString = "";
  textString += "Last Modified: " + lastModified + "\n\n";
  if (unit === undefined) {
    for (var block of blocks) {
      textString += "       <b>Block No: " + block + "</b>\n";
      textString += generateBlockAvailability(data[block]);
      textString += "\n";
    }
    textString = addLegend(textString);
    textString += "\nLast Modified: " + lastModified + "\n\n";
    sendMessage(id, textString);
  }
}

function addLegend(text) {
  text += "🟢 - available\n❌ - selected\n➖ - NA\n";
  return text;
}

function generateBlockAvailability(block) {
  var outputText = "      ";
  var units = Object.keys(block);
  for (var unit of units) {
    outputText += unit + " ";
  }
  outputText += "\n";
  for (var floor = 30; floor > 1; floor--) {
    floorString = floor >= 10 ? floor.toString() : "0" + floor.toString();

    outputText += "[" + floorString + "]  ";
    for (var unit of units) {
      var avail = block[unit]["status"][30 - floor];
      outputText += avail + "   ";
    }
    outputText += "\n";
  }
  return outputText;
}

function generateAvailabilityMessage(unit, details) {
  var textString = "";
  textString += "Unit No: " + unit + "\n";
  details["status"].forEach(function (availability, i) {
    var floor = 30 - i >= 10 ? 30 - i : "0" + (30 - i).toString();
    textString += floor + ": " + availability + "\n";
  });
  return textString;
}
