'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Eye, Plus } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'


export default function BucketsPage() {
  const [buckets, setBuckets] = useState([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [bucketName, setBucketName] = useState('')

  useEffect(() => {
    fetch('/api/bucket')
      .then(res => res.json())
      .then(data => setBuckets(data.buckets || []))
  }, [])

  const handleCreate = async () => {
    if (!/^[a-zA-Z0-9-]+$/.test(bucketName)) {
      toast('Invalid name', {
        description: 'No spaces or dots allowed. Use only letters, numbers, or hyphens.',
      })
      return
    }

    const res = await fetch('/api/bucket', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: bucketName }),
    })

    if (res.ok) {
      toast('Bucket created', {
        description: `Bucket "${bucketName}" was successfully created.`,
      })
      setBucketName('')
      setDialogOpen(false)
      const updated = await fetch('/api/bucket').then(res => res.json())
      setBuckets(updated.buckets)
    } else {
      toast('Failed to create bucket', {
        description: 'Something went wrong while creating the bucket.',
      })
    }
  }

  return (
    <div className="p-6 space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">سطل ها</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>سطل جدید</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>ایجاد سطل</DialogTitle>
            </DialogHeader>
            <Input
              placeholder="bucket-name"
              value={bucketName}
              onChange={e => setBucketName(e.target.value)}
            />
            <Button onClick={handleCreate}>Create</Button>
          </DialogContent>
        </Dialog>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-right">نام</TableHead>
            <TableHead className="text-right">عملیات</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {buckets.map(bucket => (
            <TableRow key={bucket.name}>
              <TableCell>{bucket.name}</TableCell>
              <TableCell className="text-right space-x-2">
                <Link href={`/dashboard/bucket/${bucket.name}`}>
                  <Button variant="ghost" size="icon">
                    <Eye className="w-4 h-4" />
                  </Button>
                </Link>
                <Link href={`/dashboard/product/create?bucket=${bucket.name}`}>
                  <Button variant="ghost" size="icon">
                    <Plus className="w-4 h-4" />
                  </Button>
                </Link>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
