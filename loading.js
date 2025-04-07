var twirlTimer = (function() {
    var P = ["\\", "|", "/", "-"];
    var x = 0;
    return setInterval(function() {
      process.stdout.write("\r" + P[x++]+"Mines left to open spawn:"+"1000");
      x &= 3;
    }, 150);
  })();