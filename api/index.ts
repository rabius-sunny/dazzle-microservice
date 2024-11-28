import { Hono } from 'hono'
import { handle } from 'hono/vercel'
import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import { cors } from 'hono/cors'
import {
  brands,
  products,
  categories,
  rams,
  conditions
} from '../src/db/schema'
import { count, desc, eq } from 'drizzle-orm'
import {
  createProduct,
  deleteProduct,
  getProductBy,
  getProducts,
  getProductsByCatBrand
} from '../src/controllers/products'

export const config = {
  runtime: 'edge'
}

const dburl =
  'postgresql://dazzle-exchange_owner:SqTZY9IgCLA7@ep-autumn-thunder-a11fsyou.ap-southeast-1.aws.neon.tech/dazzle-exchange?sslmode=require'

const app = new Hono().basePath('/api')

app.use('/*', cors({ origin: '*' }))

app.get('/', (c) => {
  return c.json({ message: 'Hello Hono!' })
})

app.use(async (c, next) => {
  await next()
  if (c.error) {
    return c.json({ error: c.error })
  }
})

app
  .get('/products/:id?', async (c) => {
    const allProducts = await getProducts(c)
    return c.json(allProducts)
  })
  .post(async (c) => {
    const id = await createProduct(c)
    return c.json({ id }, 201)
  })
  .delete(async (c) => {
    await deleteProduct(c)
    return c.json(200)
  })

app.get('/products/:catId/:brandId', async (c) => {
  const allProducts = await getProductsByCatBrand(c)
  return c.json(allProducts)
})
app.get('/products-by-id/:id', async (c) => {
  const product = await getProductBy(c)
  return c.json(product)
})

// create brands
app
  .get('/brand/:id?', async (c) => {
    const sql = neon(dburl)
    const db = drizzle(sql)
    const allBrands = await db.select({ brands }).from(brands)

    return c.json(allBrands)
  })
  .post(async (c) => {
    const sql = neon(dburl)
    const db = drizzle(sql)

    const body = await c.req.json()
    const { name } = body

    const createBrand = await db.insert(brands).values({ name }).returning()
    return c.json(createBrand, 201)
  })
  .delete(async (c) => {
    const id = c.req.param('id')!
    const sql = neon(dburl)
    const db = drizzle(sql)

    await db.delete(brands).where(eq(brands.id, id))
    return c.json(200)
  })

// create categories
app
  .get('/category/:id?', async (c) => {
    const sql = neon(dburl)
    const db = drizzle(sql)
    const allCategories = await db.select({ categories }).from(categories)

    return c.json(allCategories)
  })
  .post(async (c) => {
    const sql = neon(dburl)
    const db = drizzle(sql)
    const body = await c.req.json()
    const { name } = body
    const createCategory = await db
      .insert(categories)
      .values({ name })
      .returning()
    return c.json(createCategory, 201)
  })
  .delete(async (c) => {
    const id = c.req.param('id')!
    const sql = neon(dburl)
    const db = drizzle(sql)

    await db.delete(categories).where(eq(categories.id, id))
    return c.json(200)
  })

// get categories & brands
app.get('/category-brand', async (c) => {
  const sql = neon(dburl)
  const db = drizzle(sql)

  const allCategories = await db
    .select({
      id: categories.id,
      name: categories.name,
      totalProducts: count(products.id)
    })
    .from(categories)
    .leftJoin(products, eq(products.categoryId, categories.id))
    .groupBy(categories.name, categories.id)
    .orderBy(desc(categories.createdAt))

  const allBrands = await db
    .select({
      id: brands.id,
      name: brands.name,
      totalProducts: count(products.id)
    })
    .from(brands)
    .leftJoin(products, eq(products.brandId, brands.id))
    .groupBy(brands.name, brands.id)
    .orderBy(desc(brands.createdAt))

  return c.json({ allCategories, allBrands })
})

// create rams
app
  .post('/rams/:id?', async (c) => {
    const sql = neon(dburl)
    const db = drizzle(sql)
    const body = await c.req.json()
    const { count, productId } = body
    const createRam = await db
      .insert(rams)
      .values({ count, productId })
      .returning()
    return c.json({ id: createRam[0].id }, 201)
  })
  .delete(async (c) => {
    const id = c.req.param('id')
    return c.json(id)
  })

app.get('/rambypid/:id', async (c) => {
  const sql = neon(dburl)
  const db = drizzle(sql)
  const id = c.req.param('id')

  const ram = await db.select({ rams }).from(rams).where(eq(rams.productId, id))

  return c.json(ram)
})

// create conditions
app
  .post('/conditions/:id?', async (c) => {
    const sql = neon(dburl)
    const db = drizzle(sql)
    const body = await c.req.json()
    const { price1, price2, price3, ramId } = body
    const createCondition = await db
      .insert(conditions)
      .values([
        {
          type: 'New',
          price: price1,
          ramId
        },
        {
          type: 'Flawless',
          price: price2,
          ramId
        },
        {
          type: 'Average',
          price: price3,
          ramId
        }
      ])
      .returning()
    return c.json(createCondition, 201)
  })
  .delete(async (c) => {
    const id = c.req.param('id')
    return c.json(id)
  })

export default handle(app)
