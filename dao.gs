function saveUserData(message) {
  const source = SpreadsheetApp.openById(
    "1boLx6QAGlaEbGMCjI83mgk6Udklmh1C832Nmat_PJW8"
  );
  const sourceSheet = source.getSheetByName("User");
  var user = message["from"];
  // {"first_name":"Zephyr", "username":"Zephyrino1", "id":2.47573669E8, "is_bot":false, "language_code":"en", "last_name":"Tay"};
  var userExists = checkIfUserExists(user, sourceSheet);
  if (userExists) {
    return !userExists;
  }

  var firstName = user["first_name"];
  var lastName = user["last_name"];
  var username = "na";
  if (user["username"] !== undefined) {
    username =
      user["username"].replace(" ", "") === "" ? "na" : user["username"];
  }
  var createdDateTime = new Date(message["date"] * 1000);
  var chatId = user["id"];

  var ids = sourceSheet.getRange("A:A");
  var nextId = 0;
  while (ids.getValues()[nextId][0] != "") {
    console.log(ids.getValues()[nextId][0]);
    nextId++;
  }
  nextId++;
  console.log(nextId);
  var range = sourceSheet.getRange(
    "A" + nextId.toString() + ":F" + nextId.toString()
  );

  range.setValues([
    [nextId - 1, chatId, username, firstName, lastName, createdDateTime],
  ]);
  return !userExists;
}

function checkIfUserExists(user, sourceSheet) {
  var usernames = sourceSheet.getRange("C:C").getValues();
  for (var username of usernames) {
    if (username[0] === user["username"]) {
      return true;
    } else if (username[0] === "") {
      return false;
    }
  }
  return false;
}

// {
// update_id=4.65940959E8, message={text=/start, entities=[Ljava.lang.Object;@bad319e, from={first_name=Zephyr, username=Zephyrino, id=2.47573669E8, is_bot=false, language_code=en, last_name=Tay}, //// date=1.680025343E9, chat={id=2.47573669E8, first_name=Zephyr, type=private, username=Zephyrino, last_name=Tay}, message_id=115.0}}
