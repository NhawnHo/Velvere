import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import viTranslation from './translations/vi.json';
import enTranslation from './translations/en.json';

const resources = {
  en: {
    translation: enTranslation
  },
  vi: {
    translation: viTranslation
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'vi', // ngôn ngữ mặc định
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false // không cần escape vì React đã xử lý XSS
    }
  });

export default i18n;