import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import { products } from '../db/schema'
import { and, desc, eq } from 'drizzle-orm'

import * as schema from '../db/schema'

const dburl =
  'postgresql://dazzle-exchange_owner:SqTZY9IgCLA7@ep-autumn-thunder-a11fsyou.ap-southeast-1.aws.neon.tech/dazzle-exchange?sslmode=require'

export const getProducts = async (c: any) => {
  const sql = neon(dburl)
  const db = drizzle({ client: sql, schema })
  const allProducts = await db.query.products.findMany({
    with: {
      brand: {
        columns: { name: true }
      },
      category: {
        columns: { name: true }
      },
      rams: {
        with: {
          conditions: true
        }
      }
    },
    orderBy: desc(products.createdAt)
  })

  return allProducts
}
export const getProductBy = async (c: any) => {
  const sql = neon(dburl)
  const db = drizzle({ client: sql, schema })
  const id = c.req.param('id')
  // find unique product with unique id

  const product = await db.query.products.findFirst({
    where: eq(products.id, id),
    with: {
      brand: {
        columns: { name: true }
      },
      category: {
        columns: { name: true }
      },
      rams: {
        with: {
          conditions: true
        }
      }
    },
    orderBy: desc(products.createdAt)
  })
  // const product = await db
  //   .select()
  //   .from(products)
  //   .where(eq(products.id, id))
  //   .leftJoin(schema.brands, eq(products.brandId, schema.brands.id))
  //   .leftJoin(schema.categories, eq(products.categoryId, schema.categories.id))
  //   .leftJoin(schema.rams, eq(products.id, schema.rams.productId))

  return product
}

export const createProduct = async (c: any) => {
  const sql = neon(dburl)
  const db = drizzle({ client: sql, schema })

  const body = await c.req.json()
  const { name, categoryId, brandId } = body

  const createProduct = await db
    .insert(products)
    .values({ name, brandId, categoryId })
    .returning()
  return createProduct[0].id
}

export const deleteProduct = async (c: any) => {
  const sql = neon(dburl)
  const db = drizzle({ client: sql, schema })

  const id = c.req.param('id')

  await db.delete(products).where(eq(products.id, id))
}

export const getProductsByCatBrand = async (c: any) => {
  const sql = neon(dburl)
  const db = drizzle({ client: sql, schema })

  const { catId, brandId } = c.req.param()

  const allProducts = await db.query.products.findMany({
    where: and(eq(products.categoryId, catId), eq(products.brandId, brandId)),
    with: {
      brand: {
        columns: { name: true }
      },
      category: {
        columns: { name: true }
      }
    },
    orderBy: desc(products.createdAt)
  })

  return allProducts
}

export const createRequest = async (c: any) => {
  const sql = neon(dburl)
  const db = drizzle({ client: sql, schema })

  const body = await c.req.json()
  await db.insert(schema.requests).values({ ...body })
}

export const getRequests = async (c: any) => {
  const sql = neon(dburl)
  const db = drizzle({ client: sql, schema })

  const allRequests = await db.query.requests.findMany({
    with: {
      product: {
        with: {
          brand: true,
          category: true
        }
      },
      ram: true,
      condition: true
    },
    orderBy: desc(schema.requests.createdAt)
  })

  return allRequests
}

export const deleteRequest = async (c: any) => {
  const sql = neon(dburl)
  const db = drizzle({ client: sql, schema })

  const id = c.req.param('id')

  await db.delete(schema.requests).where(eq(schema.requests.id, id))
}
// export const ctrName = async (c: any) => {
//   const sql = neon(dburl)
//   const db = drizzle({ client: sql, schema })
// }
