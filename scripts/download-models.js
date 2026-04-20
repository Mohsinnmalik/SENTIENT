
import fs from 'fs';
import path from 'path';
import https from 'https';

const models = [
  'tiny_face_detector_model-weights_manifest.json',
  'tiny_face_detector_model-shard1',
  'face_expression_model-weights_manifest.json',
  'face_expression_model-shard1'
];

const baseUrl = 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/';
const targetDir = path.join(process.cwd(), 'public', 'models');

if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

models.forEach(model => {
  const file = fs.createWriteStream(path.join(targetDir, model));
  https.get(baseUrl + model, response => {
    response.pipe(file);
    file.on('finish', () => {
      file.close();
      console.log(`Downloaded ${model}`);
    });
  }).on('error', err => {
    fs.unlink(path.join(targetDir, model), () => {});
    console.error(`Error downloading ${model}: ${err.message}`);
  });
});
