import { prepareDatabase as prepareCorpusDatabase } from './utils/corpus';
import { prepareBinaries as prepareYtdlpBinaries } from './utils/ytdlp';

await Promise.all([await prepareYtdlpBinaries(), await prepareCorpusDatabase()]);
