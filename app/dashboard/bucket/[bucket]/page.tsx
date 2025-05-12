'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils' // assuming you use tailwind utils
import schemas from "@/lib/schemas.json";

export default function BucketPreviewPage() {
  const { bucket_name } = useParams()
  const [products, setProducts] = useState([])
  const [openCategories, setOpenCategories] = useState({})

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch(`/api/product?bucket=${bucket_name}`)
      const data = await res.json()
      setProducts(data.products || [])
    }

    fetchData()
  }, [bucket_name])

  const grouped = products.reduce((acc, product) => {
    const cat = product.category
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(product)
    return acc
  }, {})

  const toggleCategory = (cat: string) => {
    setOpenCategories(prev => ({ ...prev, [cat]: !prev[cat] }))
  }

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Bucket: {bucket_name}</h1>

      {Object.entries(grouped).map(([categoryId, items]) => {
        const schema = schemas[categoryId] || {}
        const fieldNames = Object.keys(schema)

        return (
          <div key={categoryId} className="border rounded-md p-4 space-y-2">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-lg font-semibold">Category: {categoryId}</h2>
                <p className="text-sm text-muted-foreground">{items.length} products</p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => toggleCategory(categoryId)}>
                {openCategories[categoryId] ? (
                  <ChevronDown className="w-5 h-5" />
                ) : (
                  <ChevronRight className="w-5 h-5" />
                )}
              </Button>
            </div>

            {openCategories[categoryId] && (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      {fieldNames.map(field => (
                        <TableHead key={field}>{schema[field]?.title || field}</TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map(product => (
                      <TableRow key={product.id}>
                        <TableCell>{product.id}</TableCell>
                        {fieldNames.map(field => {
                          const value = product.fields[field]
                          const fieldSchema = schema[field]

                          let displayValue = value
                          if (fieldSchema?.items && value in fieldSchema.items) {
                            displayValue = fieldSchema.items.find((item)=>item.const==value).title
                          }

                          return <TableCell key={field}>{String(displayValue)}</TableCell>
                        })}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
