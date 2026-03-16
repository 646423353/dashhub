import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const inputPath = path.join(__dirname, 'public', 'logo_full.png');
const outputPath = path.join(__dirname, 'public', 'logo.png');

async function processLogo() {
    try {
        if (!fs.existsSync(inputPath)) {
            console.error('Error: input image not found at', inputPath);
            process.exit(1);
        }

        const metadata = await sharp(inputPath).metadata();
        const width = metadata.width;
        const height = metadata.height;

        // 豆包AI生成的水印通常在底部右下侧
        // 我们砍掉底部 12% 的高度，确保安全避开水印
        const cropHeight = Math.floor(height * 0.88);

        // 首先裁剪掉底部包含水印的部分
        const croppedBuffer = await sharp(inputPath)
            .extract({ left: 0, top: 0, width: width, height: cropHeight })
            .toBuffer();

        // 接下来去除周围大量的空白(trim)，得到实质性的 logo 图案
        // 采用更大的容差确保连带淡阴影的白边全被切干净
        const trimmedBuffer = await sharp(croppedBuffer)
            .trim({
                background: { r: 255, g: 255, b: 255, alpha: 1 },
                threshold: 40
            })
            .toBuffer();

        // 读取 trim 回来的紧凑版本尺寸
        const trimmedMeta = await sharp(trimmedBuffer).metadata();
        const tWidth = trimmedMeta.width;
        const tHeight = trimmedMeta.height;

        // 用户明确要求需要一个"正方形的 Logo"
        // 取宽高的最大值作为正方形的边长
        const size = Math.max(tWidth, tHeight);

        // 将内容居中放置在正方形的透明背景上
        await sharp({
            create: {
                width: size,
                height: size,
                channels: 4,
                background: { r: 255, g: 255, b: 255, alpha: 0 } // 透明背景
            }
        })
            .composite([
                {
                    input: trimmedBuffer,
                    gravity: 'center'
                }
            ])
            .png()
            .toFile(outputPath);

        console.log(`Successfully recreated a SQUARE logo without watermarks! Final Size: ${size}x${size}`);

    } catch (error) {
        console.error('Error processing logo:', error);
    }
}

processLogo();
