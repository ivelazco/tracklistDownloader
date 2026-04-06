import * as path from 'path';

/**
 * Mirrors `ytdl-mp3` `removeParenthesizedText` so predicted paths match on-disk names.
 * @see node_modules/ytdl-mp3/dist/index.js (utils)
 */
export const removeParenthesizedText = (s: string): string => {
  const regex = /\s*([[(][^[\]()]*[\])])\s*/g;
  let out = s;
  while (regex.test(out)) {
    out = out.replace(regex, '');
  }
  return out;
};

/**
 * Same basename rules as `ytdl-mp3` Downloader#getOutputFile (video title → .mp3 filename).
 */
export const getYtdlMp3OutputPath = (outputDir: string, videoTitle: string): string => {
  const baseFileName = removeParenthesizedText(videoTitle)
    .replace(/[^a-z0-9]/gi, '_')
    .split('_')
    .filter(Boolean)
    .join('_')
    .toLowerCase();
  return path.join(outputDir, `${baseFileName}.mp3`);
};
