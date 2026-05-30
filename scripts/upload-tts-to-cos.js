#!/usr/bin/env node
/**
 * 上传本地TTS音频到COS
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const crypto = require('crypto');

const COS_CONFIG = {
  Bucket: 'upgrade-videos-1412449710',
  Region: 'ap-guangzhou',
  SecretId: process.env.TENCENT_SECRET_ID || '',
  SecretKey: process.env.TENCENT_SECRET_KEY || ''
};

const TTS_DIR = path.join(__dirname, '..', 'tts_audio');
const COS_PATH = 'oxford-phonics/audio/';

function uploadToCOS(localFile, cosKey) {
  return new Promise((resolve, reject) => {
    const fileContent = fs.readFileSync(localFile);
    const contentMD5 = crypto.createHash('md5').update(fileContent).digest('hex');
    const timestamp = Math.floor(Date.now() / 1000);
    const nonce = Math.random().toString(36).substr(2);

    const authStr = `a=${COS_CONFIG.SecretId}&k=${COS_CONFIG.SecretKey}&e=${timestamp + 3600}&t=${timestamp}&r=${nonce}&f=`;
    const signBase = crypto.createHmac('sha1', COS_CONFIG.SecretKey)
      .update(Buffer.from(authStr + contentMD5, 'utf8')).digest('base64');

    const body = JSON.stringify({
      bucket: COS_CONFIG.Bucket,
      appid: 1304940878,
      userid: 0,
      fileid: `/${COS_PATH}${path.basename(cosKey)}`,
      filecontent: fileContent.toString('base64'),
      insertOnly: 0
    });

    const options = {
      hostname: 'cos.' + COS_CONFIG.Region + '.myqcloud.com',
      port: 443,
      path: '/cgi-bin/component_api_upload',
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) }
    };

    console.log(`Uploading: ${path.basename(cosKey)}`);

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          console.log(`  Result: ${result.code === 0 ? 'OK' : result.message}`);
        } catch (e) {
          console.log(`  Response: ${data.substring(0, 100)}`);
        }
        resolve();
      });
    });

    req.on('error', e => { console.log(`  Error: ${e.message}`); resolve(); });
    req.write(body);
    req.end();
    setTimeout(() => { req.destroy(); resolve(); }, 15000);
  });
}

async function main() {
  console.log('='.repeat(60));
  console.log('Upload TTS to COS');
  console.log('='.repeat(60));

  const files = fs.readdirSync(TTS_DIR).filter(f => f.endsWith('.mp3'));
  console.log(`Found ${files.length} files\n`);

  for (const file of files) {
    await uploadToCOS(path.join(TTS_DIR, file), `${COS_PATH}${file}`);
    await new Promise(r => setTimeout(r, 200));
  }

  console.log('\nDone!');
}

main();
