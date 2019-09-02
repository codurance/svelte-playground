'use strict';

function printMap() {
  var map = document.querySelector("#abs-bcn-map");

  html2canvas(map).then(canvas => {
    let pdf = new jsPDF("p", "mm", "a4");
    pdf.addImage(canvas.toDataURL(), "PNG", 0, 0, 211, 298);
    pdf.save(map.dataset.filename);
  });
}

$(document).ready(function () {
  $("#exportMap").on("click", function () {
    printMap();
  });
});
