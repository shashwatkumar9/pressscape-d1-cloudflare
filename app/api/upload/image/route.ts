// NOTE: This route uses Node.js runtime for filesystem operations
// For production deployment on Cloudflare, consider using R2 for file storage
// export const runtime = "edge"; // Disabled - requires Node.js for fs operations

import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import crypto from 'crypto';
import { existsSync } from 'fs';




const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get('image') as File;

        if (!file) {
            return NextResponse.json(
                { error: 'No image file provided' },
                { status: 400 }
            );
        }

        // Validate file type
        if (!ALLOWED_TYPES.includes(file.type)) {
            return NextResponse.json(
                { error: 'Invalid file type. Allowed: JPG, PNG, WebP, GIF' },
                { status: 400 }
            );
        }

        // Validate file size
        if (file.size > MAX_SIZE) {
            return NextResponse.json(
                { error: 'File too large. Maximum size is 5MB' },
                { status: 400 }
            );
        }

        // Generate unique filename
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const hash = crypto.createHash('md5').update(buffer).digest('hex').substring(0, 8);
        const ext = file.name.split('.').pop();
        const timestamp = Date.now();
        const filename = `${timestamp}-${hash}.${ext}`;

        // Ensure upload directory exists
        const uploadDir = join(process.cwd(), 'public', 'uploads', 'blog');
        if (!existsSync(uploadDir)) {
            await mkdir(uploadDir, { recursive: true });
        }

        // Save file
        const filepath = join(uploadDir, filename);
        await writeFile(filepath, buffer);

        // Return public URL
        const url = `/uploads/blog/${filename}`;

        return NextResponse.json({
            success: true,
            url,
            filename,
            size: file.size,
            type: file.type,
        });
    } catch (error) {
        console.error('Image upload error:', error);
        return NextResponse.json(
            { error: 'Failed to upload image' },
            { status: 500 }
        );
    }
}
