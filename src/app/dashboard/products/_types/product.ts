// {
//     "sku": "AAA000002",
//     "kala": "68322a7a534d1b21f43fca94",
//     "bucket": "68341aab5db4d40cb920ec13",
//     "digikalaData": {
//         "product[title_fa]": "محصول تستی زیبا"
//     },
//     "images": [
//         "6834af00ed113f55ff6ba678"
//     ],
//     "pricing": {
//         "wage": 23,
//         "profit": 7
//     },
//     "variants": [
//         {
//             "weight": 1,
//             "stock": 1,
//             "extras_price": 0,
//             "extras_wage": 0
//         },
//         {
//             "weight": 2,
//             "stock": 1,
//             "extras_price": 0,
//             "extras_wage": 0
//         }
//     ]
// }

export interface ProductCreate {
  sku: string;
  kala: string;
  bucket: string;
  digikalaData: Record<string, string>;
  images: string[];
  pricing: {
    wage: number;
    profit: number;
  };
  variants: Variant[];
}

interface Variant {
  weight: number;
  stock: number;
  extras_price: number;
  extras_wage: number;
}
