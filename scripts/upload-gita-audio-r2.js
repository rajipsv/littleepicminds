/**
 * Upload lib/data/gita_audio/{verseId}.wav to Cloudflare R2 (S3-compatible API).
 *
 * Env (from backend/.env or shell):
 *   R2_ACCOUNT_ID
 *   R2_ACCESS_KEY_ID
 *   R2_SECRET_ACCESS_KEY
 *   R2_BUCKET_NAME
 *   R2_PUBLIC_BASE_URL   e.g. https://pub-xxxxx.r2.dev (no trailing slash)
 *
 * Optional:
 *   GITA_AUDIO_BASE_URL  same as R2_PUBLIC_BASE_URL (printed for Vercel)
 *
 *   npm run gita:upload-r2
 *   npm run gita:upload-r2 -- --dry-run
 *   npm run gita:upload-r2 -- --chapter=1
 *
 * After upload, apply CORS: Cloudflare dashboard → R2 bucket → Settings → CORS
 *   or: wrangler r2 bucket cors put <bucket> --file scripts/r2-cors-gita-audio.json
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', 'backend', '.env') });
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const fs = require('fs');
const path = require('path');
const { AUDIO_DIR, listAvailableVerseIds } = require('../lib/gita-audio');

function parseChapterArg() {
  const arg = process.argv.find((a) => a.startsWith('--chapter='));
  if (!arg) return null;
  return parseInt(arg.split('=')[1], 10);
}

function requireEnv(name) {
  const v = (process.env[name] || '').trim();
  if (!v) throw new Error(`Missing env: ${name}`);
  return v;
}

async function getS3Client() {
  let S3Client;
  let PutObjectCommand;
  try {
    ({ S3Client, PutObjectCommand } = require('@aws-sdk/client-s3'));
  } catch {
    console.error('Install @aws-sdk/client-s3: npm install -D @aws-sdk/client-s3');
    process.exit(1);
  }

  const accountId = requireEnv('R2_ACCOUNT_ID');
  const accessKeyId = requireEnv('R2_ACCESS_KEY_ID');
  const secretAccessKey = requireEnv('R2_SECRET_ACCESS_KEY');
  const bucket = requireEnv('R2_BUCKET_NAME');

  const client = new S3Client({
    region: 'auto',
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId, secretAccessKey },
  });

  return { client, PutObjectCommand, bucket };
}

async function main() {
  const dryRun = process.argv.includes('--dry-run');
  const chapter = parseChapterArg();
  const publicBase = (process.env.R2_PUBLIC_BASE_URL || process.env.GITA_AUDIO_BASE_URL || '').trim().replace(/\/$/, '');

  if (!fs.existsSync(AUDIO_DIR)) {
    console.error(`No audio dir: ${AUDIO_DIR}\nRun: npm run gita:sync-hf-audio`);
    process.exit(1);
  }

  const files = fs
    .readdirSync(AUDIO_DIR)
    .filter((f) => f.endsWith('.wav'))
    .map((f) => f.replace(/\.wav$/, ''))
    .filter((id) => /^\d+\.\d+$/.test(id))
    .filter((id) => !chapter || id.startsWith(`${chapter}.`))
    .sort();

  if (!files.length) {
    console.error('No .wav files to upload. Run: npm run gita:sync-hf-audio');
    process.exit(1);
  }

  if (dryRun) {
    console.log(`Dry run: would upload ${files.length} files to R2`);
    if (publicBase) console.log(`Public URL pattern: ${publicBase}/{verseId}.wav`);
    return;
  }

  const { client, PutObjectCommand, bucket } = await getS3Client();
  let ok = 0;
  let fail = 0;

  for (const verseId of files) {
    const key = `${verseId}.wav`;
    const fp = path.join(AUDIO_DIR, key);
    try {
      const body = fs.readFileSync(fp);
      await client.send(
        new PutObjectCommand({
          Bucket: bucket,
          Key: key,
          Body: body,
          ContentType: 'audio/wav',
          CacheControl: 'public, max-age=31536000, immutable',
        })
      );
      ok++;
      if (ok % 50 === 0) console.log(`  uploaded ${ok}/${files.length}…`);
    } catch (e) {
      fail++;
      console.warn(`  failed ${verseId}: ${e.message}`);
    }
  }

  console.log(`Done. uploaded=${ok} failed=${fail} bucket=${bucket}`);
  if (publicBase) {
    console.log('\nSet on Vercel (Production):');
    console.log(`  GITA_AUDIO_BASE_URL=${publicBase}`);
    console.log(`  VITE_GITA_AUDIO_BASE_URL=${publicBase}`);
    console.log('\nCORS: apply scripts/r2-cors-gita-audio.json to the R2 bucket.');
  } else {
    console.warn('\nSet R2_PUBLIC_BASE_URL (or GITA_AUDIO_BASE_URL) for the printed Vercel env hints.');
  }
}

main().catch((e) => {
  console.error(e.message || e);
  process.exit(1);
});
