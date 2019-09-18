const Config = {
  skipLabel: 'Sortir',
  doneLabel: 'Finalitzar',
  nextLabel: 'Següent',
  prevLabel: 'Anterior',
  showStepNumbers: 0,
  disableInteraction: 1,
  exitOnOverlayClick: 0,
  helperElementPadding: -5,
  steps: [
    {
      intro:
        'Benvinguts a SiSalut, aquest és un petit tutorial de com emprar el sistema.'
    },
    {
      element: '#step1',
      intro: 'Aquí veuràs el títol del gràfic visualitzat.',
      position: 'left'
    },
    {
      element: '#step2',
      intro: 'Aquí podràs seleccionar el mode de visualització.',
      position: 'bottom-right-aligned'
    },
    {
      element: '#step3',
      intro:
        'Aquest és un exemple de visualització. Si selecciones un sector i fas click podràs veure el detall.',
      scrollTo: 'tooltip'
    },
    {
      element: '#step4',
      intro:
        'En aquesta secció podràs aplicar els diferents tipus de filtres i accions sobre el gràfic.'
    }
  ]
};

export default Config;
