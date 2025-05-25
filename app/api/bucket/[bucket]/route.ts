import fs from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';

export async function GET(request, { params }) {
    const { bucket } = params;
    console.log(params)
    try {
        // Build path to JSON file
        const filePath = path.join(process.env.BASE_PRODUCTS_DIR, `${bucket}.json`);
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        const products = JSON.parse(fileContent).products;

        return NextResponse.json(products);
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
