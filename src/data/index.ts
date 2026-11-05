// Pick the content for a language. The pt-BR files are optional at build time:
// if one is missing, the English content is used so the build never breaks.
import * as siteEn from './site';
import * as systemsEn from './systems';
import type { Lang } from '../i18n/ui';

const ptSite = Object.values(import.meta.glob('./site.pt.ts', { eager: true }))[0] as typeof siteEn | undefined;
const ptSystems = Object.values(import.meta.glob('./systems.pt.ts', { eager: true }))[0] as typeof systemsEn | undefined;

export const getSite = (lang: Lang): typeof siteEn => (lang === 'pt' && ptSite ? ptSite : siteEn);
export const getSystems = (lang: Lang) => (lang === 'pt' && ptSystems ? ptSystems.systems : systemsEn.systems);
