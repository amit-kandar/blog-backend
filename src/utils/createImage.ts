import { createCanvas, CanvasRenderingContext2D } from 'canvas';
import * as fs from 'fs';
import * as path from 'path';

export async function createImageWithInitials(name: string): Promise<string> {
    if (!name) throw new Error("Name is required");

    const canvasWidth = 500;
    const canvasHeight = 500;
    const fontSize = 350;

    // Define an array of background colors
    const backgroundColors = ['#43A5BE', '#53BDA5', '#253342', '#5C62D6', '#F07857', '#4FB06D'];

    // Randomly select a background color
    const backgroundColor = backgroundColors[Math.floor(Math.random() * backgroundColors.length)];

    // Create a new canvas instance
    const canvas = createCanvas(canvasWidth, canvasHeight);
    const ctx: CanvasRenderingContext2D = canvas.getContext('2d');

    // Set background color
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // Set font styles
    ctx.fillStyle = 'white';
    ctx.font = `${fontSize}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Get initials from the provided name
    const initialsArray = name.trim().match(/\b(\w)/g);

    // Handle null result with optional chaining and nullish coalescing
    const initials = initialsArray?.join('').toUpperCase() || '';

    // Center the initials on the canvas
    const textX = canvasWidth / 2;
    const textY = canvasHeight / 2;
    ctx.fillText(initials, textX, textY);

    // Generate a unique 6-digit number
    const uniqueNumber = Math.floor(100000 + Math.random() * 900000);

    // Construct the filename with the username and the unique number
    const fileName = `${name.replace(/\s+/g, '_')}_${uniqueNumber}.png`; // Replace spaces with underscores in the username

    // Define the file path for the public/temp directory (from project root)
    const projectRoot = path.resolve(__dirname, '../..'); // Assuming the script is in src/utils directory
    const filePath = path.join(projectRoot, 'public', 'temp', fileName);

    // Create a writable stream to save the image
    const out = fs.createWriteStream(filePath);
    const stream = canvas.createPNGStream();
    stream.pipe(out);

    // Return the file path of the created image (relative to project root)
    const relativeFilePath = path.join('public', 'temp', fileName);
    return relativeFilePath;
}
