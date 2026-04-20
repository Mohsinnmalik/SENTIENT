
const fs = require('fs');
const path = require('path');

const srcDir = path.join(process.cwd(), 'node_modules', '@mediapipe', 'hands');
const destDir = path.join(process.cwd(), 'public', 'mediapipe', 'hands');

if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
}

const filesToCopy = [
    'hands_solution_simd_wasm_bin.wasm',
    'hands_solution_simd_wasm_bin.js',
    'hands_solution_wasm_bin.wasm',
    'hands_solution_wasm_bin.js',
    'hands.binarypb',
    'hand_landmark_full.tflite',
    'hand_landmark_lite.tflite',
    'hands_solution_packed_assets.data',
    'hands_solution_packed_assets_loader.js'
];

filesToCopy.forEach(file => {
    const src = path.join(srcDir, file);
    const dest = path.join(destDir, file);
    if (fs.existsSync(src)) {
        fs.copyFileSync(src, dest);
        console.log(`Copied ${file}`);
    } else {
        console.warn(`File not found: ${src}`);
    }
});
