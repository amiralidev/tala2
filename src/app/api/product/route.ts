import fs from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';

export async function POST(request) {
    try {
        const body = await request.json();
        const { bucket, data } = body;

        if (!bucket || !data || typeof bucket !== 'string') {
            return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
        }

        const filePath = path.join(process.env.BASE_PRODUCTS_DIR, `${bucket}.json`);

        if (!fs.existsSync(filePath)) {
            return NextResponse.json({ error: 'File not found' }, { status: 404 });
        }

        const fileContent = fs.readFileSync(filePath, 'utf-8');
        let jsonFile

        try {
            jsonFile = JSON.parse(fileContent);
        } catch (e) {
            return NextResponse.json({ error: 'Invalid JSON format' }, { status: 500 });
        }

        if (!Array.isArray(jsonFile.products)) {
            return NextResponse.json({ error: 'JSON file does not contain an array' }, { status: 400 });
        }

        jsonFile.products.push(data);
        fs.writeFileSync(filePath, JSON.stringify(jsonFile, null, 2));

        return NextResponse.json({ success: true, message: 'Data appended successfully' });
    } catch (error) {
        return NextResponse.json(
            { error: 'Internal server error', details: error.message },
            { status: 500 }
        );
    }
}


export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const bucket = searchParams.get('bucket');
    const sku = searchParams.get('sku');

    if (!bucket || !sku) {
        return NextResponse.json({ error: 'Missing bucket_id or product_id' }, { status: 400 });
    }

    try {
        // Build path to JSON file
        const filePath = path.join(process.env.BASE_PRODUCTS_DIR, `${bucket}.json`);
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        const products = JSON.parse(fileContent).products;

        // Find product by sku
        const product = products.find((p: any) => p.sku === sku);

        if (!product) {
            return NextResponse.json({ error: 'Product not found' }, { status: 404 });
        }

        return NextResponse.json(product);
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}