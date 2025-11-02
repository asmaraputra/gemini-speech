import { Voice, VoiceStyle } from './types';

const COMMON_STYLES: VoiceStyle[] = [
  { name: 'Default', value: '' },
  { name: 'Santai (Cheerful)', value: 'Say cheerfully: ' },
  { name: 'Profesional (Formal)', value: 'Say in a formal and professional tone: ' },
  { name: 'Pembaca Berita (Newscaster)', value: 'Say in a newscaster voice: ' },
  { name: 'Humoris (Humorous)', value: 'Say in a humorous and funny tone: ' },
  { name: 'Wartawan (Reporter)', value: 'Say in an urgent, reporting tone: ' },
];

export const VOICES: Voice[] = [
  { name: 'Kore (Female)', value: 'Kore', styles: COMMON_STYLES },
  { name: 'Puck (Male)', value: 'Puck', styles: COMMON_STYLES },
  { name: 'Charon (Male)', value: 'Charon', styles: COMMON_STYLES },
  { name: 'Fenrir (Male)', value: 'Fenrir', styles: COMMON_STYLES },
  { name: 'Zephyr (Female)', value: 'Zephyr', styles: COMMON_STYLES },
];
