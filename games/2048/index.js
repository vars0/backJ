window.onload = function () {
  buildGridOverlay();
  cellCreator(2, 0);
  directions();
  score(0);
};
function buildGridOverlay() {
  var size = 4;
  var table = document.createElement("DIV");
  table.className += "grid";
  table.id = " ";
  table.dataset.value = 0;
  for (var i = 0; i < size; i++) {
    var tr = document.createElement("DIV");
    table.appendChild(tr);
    tr.id = "row_" + (i + 1);
    tr.className += "grid_row";
    for (var j = 0; j < size; j++) {
      var td = document.createElement("DIV");
      td.id = "" + (i + 1) + (j + 1); //ID with x y
      td.className += "grid_cell";
      tr.appendChild(td);
    }
    document.body.appendChild(table);
  }
  return table;
}
function cellCreator(c, timeOut) {
  for (var i = 0; i < c; i++) {
    for (var value = 1; value < 2; value++) {
      var randomX = Math.floor(Math.random() * 4 + 1);
      var randomY = Math.floor(Math.random() * 4 + 1);
      var checker = document.getElementById("" + randomX + randomY);
      if (checker.innerHTML != "") {
        value = 0;
      }
    }
    var randomValue = Math.floor(Math.random() * 4 + 1);
    if (randomValue == 3) {
      randomValue = 4;
    }
    if (randomValue == 1) {
      randomValue = 2;
    }
    var position = document.getElementById("" + randomX + randomY);
    var tile = document.createElement("DIV");
    position.appendChild(tile);
    tile.innerHTML = "" + randomValue;

    colorSet(randomValue, tile);
    tile.data = "" + randomValue;
    tile.id = "tile_" + randomX + randomY;
    position.className += " active";
    tile.dataset.value = "" + randomValue;
    console.info("" + timeOut);
    if (timeOut == 0) {
      tile.className = "tile " + randomValue;
    } else {
      setTimeout(function () {
        tile.className = "tile " + randomValue;
      }, 10);
    }
  }
}
document.onkeydown = directions;
function directions(e) {
  e = e || window.event;
  // ----- KEY UP ----- //
  if (e.keyCode == "38") {
    var count = 2;
    for (var x = 2; x > 1; x--) {
      for (var y = 1; y < 5; y++) {
        moveTilesMain(x, y, -1, 0);
        console.info("" + x + y);
      }
      if (x == 2) {
        x += count;
        count++;
      }
      if (count > 4) {
        break;
      }
    }
    cellReset();
  }
  // ----- KEY DOWN ----- //
  else if (e.keyCode == "40") {
    // down
    var count = -2;
    for (var x = 3; x < 4; x++) {
      for (var y = 1; y < 5; y++) {
        moveTilesMain(x, y, 1, 0);
      }
      if (x == 3) {
        x += count;
        count--;
      }
      if (count < -4) {
        break;
      }
    }
    cellReset();
  }
  // ----- KEY LEFT ----- //
  else if (e.keyCode == "37") {
    var count = 2;
    for (var x = 2; x > 1; x--) {
      for (var y = 1; y < 5; y++) {
        moveTilesMain(y, x, 0, -1);
      }
      if (x == 2) {
        x += count;
        count++;
      }
      if (count > 4) {
        break;
      }
    }
    cellReset();
  }
  // ----- KEY RIGHT ----- //
  else if (e.keyCode == "39") {
    var count = -2;
    for (var x = 3; x < 4; x++) {
      for (var y = 1; y < 5; y++) {
        moveTilesMain(y, x, 0, 1);
      }
      if (x == 3) {
        x += count;
        count--;
      }
      if (count < -4) {
        break;
      }
    }
    cellReset();
  }
}
function moveTilesMain(x, y, X, Y) {
  var tile = document.getElementById("tile_" + x + y);
  var checker = document.getElementById("" + x + y);
  var xAround = x + X;
  var yAround = y + Y;
  if (
    xAround > 0 &&
    xAround < 5 &&
    yAround > 0 &&
    yAround < 5 &&
    checker.className == "grid_cell active"
  ) {
    var around = document.getElementById("" + xAround + yAround);
    if (around.className == "grid_cell active") {
      var aroundTile = document.getElementById("tile_" + xAround + yAround);
      if (aroundTile.innerHTML == tile.innerHTML) {
        var value = tile.dataset.value * 2;
        aroundTile.dataset.value = "" + value;
        aroundTile.className = "tile " + value;
        aroundTile.innerHTML = "" + value;
        colorSet(value, aroundTile);
        checker.removeChild(tile);
        checker.className = "grid_cell";
        around.className = "grid_cell active merged";
        document.getElementsByClassName("grid").id = "moved";
        document.getElementsByClassName("grid").className = "grid " + value;
        var grid = document.getElementById(" ");
        var scoreValue = parseInt(grid.dataset.value);
        var newScore = value + scoreValue;
        grid.dataset.value = newScore;
        var score = document.getElementById("value");
        score.innerHTML = "" + newScore;
      }
    } else if (around.className == "grid_cell") {
      around.appendChild(tile);
      around.className = "grid_cell active";
      tile.id = "tile_" + xAround + yAround;
      checker.className = "grid_cell";
      document.getElementsByClassName("grid").id = "moved";
    }
  }
}
function cellReset() {
  var count = 0;
  for (var x = 1; x < 5; x++) {
    for (var y = 1; y < 5; y++) {
      var resetter = document.getElementById("" + x + y);
      if (resetter.innerHTML != "") {
        count++;
      }
      if (resetter.innerHTML == "") {
        resetter.className = "grid_cell";
      }
      if (resetter.className == "grid_cell active merged") {
        resetter.className = "grid_cell active";
      }
    }
  }
  if (count == 16) {
    document.getElementById("status").className = "lose";
  } else if (document.getElementsByClassName("grid").id == "moved") {
    cellCreator(1, 1);
  }
  document.getElementsByClassName("grid").id = " ";
}
function score() {
  var grid = document.getElementById(" ");
  var value = grid.dataset.value;
  document.getElementById("value").innerHTML = "" + value;
}
function colorSet(value, tile) {
  switch (value) {
    case 2:
      tile.style.background = "#fbfced";
      tile.style.color = "black";
      break;
    case 4:
      tile.style.background = "#ecefc6";
      tile.style.color = "black";
      break;
    case 8:
      tile.style.background = "#ffb296";
      tile.style.color = "black";
      break;
    case 16:
      tile.style.background = "#ff7373";
      tile.style.color = "black";
      break;
    case 32:
      tile.style.background = "#f6546a";
      tile.style.color = "white";
      break;
    case 64:
      tile.style.background = "#8b0000";
      tile.style.color = "white";
      break;
    case 128:
      tile.style.background = "#794044";
      tile.style.color = "white";
      tile.style.fontSize = "50px";
      break;
    case 256:
      tile.style.background = "#31698a";
      tile.style.color = "white";
      tile.style.fontSize = "50px";
      break;
    case 512:
      tile.style.background = "#297A76";
      tile.style.color = "white";
      tile.style.fontSize = "50px";
      break;
    case 1024:
      tile.style.background = "#2D8A68";
      tile.style.color = "white";
      tile.style.fontSize = "40px";
      break;
    case 2048:
      tile.style.background = "#1C9F4E";
      tile.style.color = "white";
      tile.style.fontSize = "40px";
      document.getElementById("status").className = "won";
      break;
    case 4096:
      tile.style.background = "#468499";
      tile.style.color = "white";
      tile.style.fontSize = "40px";
      break;
    case 8192:
      tile.style.background = "#0E2F44";
      tile.style.color = "white";
      tile.style.fontSize = "40px";
      break;
  }
}
function info() {
  setTimeout(function () {
    document.getElementById("description").classList.toggle("show");
  }, 10);
}
function reset() {
  for (var x = 1; x < 5; x++) {
    for (var y = 1; y < 5; y++) {
      var resetter = document.getElementById("" + x + y);
      if (resetter.className == "grid_cell active") {
        var tile = document.getElementById("tile_" + x + y);
        resetter.removeChild(tile);
      }
    }
  }
  document.getElementById("status").className = "";
  document.getElementById(" ").dataset.value = 0;
  score();
  cellReset();
  cellCreator(2, 0);
}
