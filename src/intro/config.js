const Config = {
  skipLabel: 'Salir',
  doneLabel: 'Finalizar',
  nextLabel: 'Siguiente',
  prevLabel: 'Anterior',
  showStepNumbers: 0,
  disableInteraction: 1,
  exitOnOverlayClick: 0,
  helperElementPadding: -5,
  steps: [
    {
      intro:
        'Bienvenido a SiSalut, este es un pequeño tutorial de como utilizar el sistema.'
    },
    {
      element: '#step1',
      intro: 'Aquí veras el título del gráfico visualizado.',
      position: 'left'
    },
    {
      element: '#step2',
      intro: 'Aquí podrás seleccionar el modo de visualización.',
      position: 'bottom-right-aligned'
    },
    {
      element: '#step3',
      intro:
        'Este es un ejemplo de visualización, si seleccionas un sector y haces click podrás ver el detalle.',
      scrollTo: 'tooltip'
    },
    {
      element: '#step4',
      intro:
        'En esta sección podrás aplicar los diferentes tipos de filtros y acciones sobre el gráfico.'
    }
  ]
};

export default Config;
