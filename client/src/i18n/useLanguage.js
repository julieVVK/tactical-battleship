// File was created by Vladyslav Doroshenko

import {useContext} from 'react';
import {LanguageContext} from './LanguageContext.js';

export function useLanguage() {
    return useContext(LanguageContext);
}
