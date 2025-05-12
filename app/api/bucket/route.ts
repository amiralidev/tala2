import fs from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const dirPath = process.env.BASE_PRODUCTS_DIR;
        const files = fs.readdirSync(dirPath);

        // Filter `.json` files and strip extensions
        const jsonFiles = files
            .filter(file => file.endsWith('.json'))
            .map(file => path.basename(file, '.json'));

        return NextResponse.json({ buckets: jsonFiles.map((name) => ({ "name": name })) });
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to read directory', details: error.message },
            { status: 500 }
        );
    }
}

export async function POST(request) {
    try {
        const body = await request.json();
        const { name } = body;

        if (!name || typeof name !== 'string') {
            return NextResponse.json({ error: 'Bucket name is required' }, { status: 400 });
        }

        const filePath = path.join(process.env.BASE_PRODUCTS_DIR, `${name}.json`);

        if (fs.existsSync(filePath)) {
            return NextResponse.json({ error: 'Bucket already exists' }, { status: 400 });
        }

        const initialContent = {
            products: []
        };

        fs.writeFileSync(filePath, JSON.stringify(initialContent, null, 2));

        return NextResponse.json({ success: true, message: `Bucket '${name}' created.` });
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to create file', details: error.message },
            { status: 500 }
        );
    }
}
