// Pick the content for a language. The pt-BR files are optional at build time:
// if one is missing, the English content is used so the build never breaks.
import * as siteEn from './site';
import type { Lang } from '../i18n/ui';

const ptSite = Object.values(import.meta.glob('./site.pt.ts', { eager: true }))[0] as typeof siteEn | undefined;

export const getSite = (lang: Lang): typeof siteEn => (lang === 'pt' && ptSite ? ptSite : siteEn);
