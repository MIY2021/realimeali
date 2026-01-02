/**
 * UK Spelling Conversion Utility
 * Automatically converts US spellings to UK spellings for user-facing text
 */

// Comprehensive mapping of US to UK spellings
const US_TO_UK_MAP: Record<string, string> = {
  // -ize → -ise
  'organize': 'organise',
  'organizes': 'organises',
  'organized': 'organised',
  'organizing': 'organising',
  'organization': 'organisation',
  'organizations': 'organisations',
  'recognize': 'recognise',
  'recognizes': 'recognises',
  'recognized': 'recognised',
  'recognizing': 'recognising',
  'recognizer': 'recogniser',
  'optimize': 'optimise',
  'optimizes': 'optimises',
  'optimized': 'optimised',
  'optimizing': 'optimising',
  'optimization': 'optimisation',
  'optimizations': 'optimisations',
  'optimizer': 'optimiser',
  'customize': 'customise',
  'customizes': 'customises',
  'customized': 'customised',
  'customizing': 'customising',
  'customization': 'customisation',
  'customizations': 'customisations',
  'analyze': 'analyse',
  'analyzes': 'analyses',
  'analyzed': 'analysed',
  'analyzing': 'analysing',
  'analyzer': 'analyser',
  'finalize': 'finalise',
  'finalizes': 'finalises',
  'finalized': 'finalised',
  'finalizing': 'finalising',
  'finalization': 'finalisation',
  'authorize': 'authorise',
  'authorizes': 'authorises',
  'authorized': 'authorised',
  'authorizing': 'authorising',
  'authorization': 'authorisation',
  'authorizations': 'authorisations',
  'categorize': 'categorise',
  'categorizes': 'categorises',
  'categorized': 'categorised',
  'categorizing': 'categorising',
  'categorization': 'categorisation',
  'categorizations': 'categorisations',
  'prioritize': 'prioritise',
  'prioritizes': 'prioritises',
  'prioritized': 'prioritised',
  'prioritizing': 'prioritising',
  'prioritization': 'prioritisation',
  'specialize': 'specialise',
  'specializes': 'specialises',
  'specialized': 'specialised',
  'specializing': 'specialising',
  'specialization': 'specialisation',
  'specializations': 'specialisations',
  'standardize': 'standardise',
  'standardizes': 'standardises',
  'standardized': 'standardised',
  'standardizing': 'standardising',
  'standardization': 'standardisation',
  'standardizations': 'standardisations',
  'summarize': 'summarise',
  'summarizes': 'summarises',
  'summarized': 'summarised',
  'summarizing': 'summarising',
  'summarization': 'summarisation',
  'summarizations': 'summarisations',
  'synchronize': 'synchronise',
  'synchronizes': 'synchronises',
  'synchronized': 'synchronised',
  'synchronizing': 'synchronising',
  'synchronization': 'synchronisation',
  'synchronizations': 'synchronisations',
  'utilize': 'utilise',
  'utilizes': 'utilises',
  'utilized': 'utilised',
  'utilizing': 'utilising',
  'utilization': 'utilisation',
  'utilizations': 'utilisations',
  'visualize': 'visualise',
  'visualizes': 'visualises',
  'visualized': 'visualised',
  'visualizing': 'visualising',
  'visualization': 'visualisation',
  'visualizations': 'visualisations',
  
  // -or → -our
  'color': 'colour',
  'colors': 'colours',
  'colored': 'coloured',
  'coloring': 'colouring',
  'favorite': 'favourite',
  'favorites': 'favourites',
  'favorited': 'favourited',
  'favoriting': 'favouriting',
  'favor': 'favour',
  'favors': 'favours',
  'honor': 'honour',
  'honors': 'honours',
  'honored': 'honoured',
  'honoring': 'honouring',
  'humor': 'humour',
  'humors': 'humours',
  'humored': 'humoured',
  'humoring': 'humouring',
  'labor': 'labour',
  'labors': 'labours',
  'labored': 'laboured',
  'laboring': 'labouring',
  'neighbor': 'neighbour',
  'neighbors': 'neighbours',
  'neighbored': 'neighboured',
  'neighboring': 'neighbouring',
  'rumor': 'rumour',
  'rumors': 'rumours',
  'rumored': 'rumoured',
  'rumoring': 'rumouring',
  'vapor': 'vapour',
  'vapors': 'vapours',
  'vaporized': 'vaporised',
  'vaporizing': 'vaporising',
  
  // -er → -re
  'center': 'centre',
  'centers': 'centres',
  'centered': 'centred',
  'centering': 'centring',
  'centerpiece': 'centrepiece',
  'fiber': 'fibre',
  'fibers': 'fibres',
  'theater': 'theatre',
  'theaters': 'theatres',
  'theatergoer': 'theatregoer',
  'theatergoers': 'theatregoers',
  
  // -ense → -ence
  'defense': 'defence',
  'defenses': 'defences',
  'defenseless': 'defenceless',
  'offense': 'offence',
  'offenses': 'offences',
  'offensive': 'offensive', // Same in both
  'license': 'licence', // Noun
  'licenses': 'licences', // Noun
  'licensed': 'licensed', // Verb (same in both)
  'licensing': 'licensing', // Verb (same in both)
  'pretense': 'pretence',
  'pretenses': 'pretences',
  
  // -og → -ogue
  'dialog': 'dialogue',
  'dialogs': 'dialogues',
  'analog': 'analogue',
  'analogs': 'analogues',
  'catalog': 'catalogue',
  'catalogs': 'catalogues',
  'cataloged': 'catalogued',
  'cataloging': 'cataloguing',
  'cataloger': 'cataloguer',
  'catalogers': 'cataloguers',
  'prolog': 'prologue',
  'prologs': 'prologues',
  'monolog': 'monologue',
  'monologs': 'monologues',
  'epilog': 'epilogue',
  'epilogs': 'epilogues',
  
  // -l → -ll (doubled)
  'traveled': 'travelled',
  'traveling': 'travelling',
  'traveler': 'traveller',
  'travelers': 'travellers',
  'canceled': 'cancelled',
  'canceling': 'cancelling',
  'cancelation': 'cancellation',
  'cancelations': 'cancellations',
  'labeled': 'labelled',
  'labeling': 'labelling',
  'modeled': 'modelled',
  'modeling': 'modelling',
  'modeler': 'modeller',
  'modelers': 'modellers',
  'signaled': 'signalled',
  'signaling': 'signalling',
  'signaler': 'signaller',
  'signalers': 'signallers',
  'tunneled': 'tunnelled',
  'tunneling': 'tunnelling',
  'tunneler': 'tunneller',
  'tunnelers': 'tunnellers',
  
  // Other common differences
  'behavior': 'behaviour',
  'behaviors': 'behaviours',
  'behavioral': 'behavioural',
  'jewelry': 'jewellery',
  'jewelries': 'jewelleries',
  'jeweler': 'jeweller',
  'jewelers': 'jewellers',
  'jeweled': 'jewelled',
  'jeweling': 'jewelling',
  'judgment': 'judgement',
  'judgments': 'judgements',
  'practice': 'practice', // Same in both (noun)
  'practiced': 'practised', // Verb
  'practicing': 'practising', // Verb
  'practitioner': 'practitioner', // Same in both
  'practitioners': 'practitioners', // Same in both
};

/**
 * Converts US spelling to UK spelling in a string
 * @param text - The text to convert
 * @returns The text with UK spellings
 */
export function toUKSpelling(text: string): string {
  if (!text || typeof text !== 'string') {
    return text;
  }

  let result = text;
  
  // Replace whole words (case-insensitive, preserving case)
  for (const [us, uk] of Object.entries(US_TO_UK_MAP)) {
    // Case-insensitive regex that preserves original case
    const regex = new RegExp(`\\b${us}\\b`, 'gi');
    result = result.replace(regex, (match) => {
      // Preserve case: if original was capitalized, capitalize UK version
      if (match[0] === match[0].toUpperCase()) {
        return uk.charAt(0).toUpperCase() + uk.slice(1);
      }
      return uk;
    });
  }
  
  return result;
}

/**
 * React hook for automatic UK spelling conversion
 * Use this in components to automatically convert user-facing text
 */
export function useUKSpelling(text: string): string {
  return toUKSpelling(text);
}

