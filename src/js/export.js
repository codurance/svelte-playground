function printMap() {
  var map = document.querySelector('#abs-bcn-map');

  html2canvas(map, { width: 1800, height: 1800, scale: 1 }).then(
    canvas => {
      let pdf = jsPDF('p', 'pt', 'a4', true);

      pdf.addImage(canvas.toDataURL(), 'PNG', 5, 22, 920, 1200);

      pdf.save(map.dataset.filename);
    },
  );
}

$(document).ready(function() {
  $('#exportMap').on('click', function() {
    printMap();
  });
});
