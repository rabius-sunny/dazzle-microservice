import {
  pgTable,
  text,
  uuid,
  integer,
  decimal,
  pgEnum,
  timestamp
} from 'drizzle-orm/pg-core'
import { sql, relations } from 'drizzle-orm'

// Products Table
export const products = pgTable('products', {
  id: uuid('id')
    .unique()
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  name: text('name').notNull(),
  categoryId: uuid('category_id').references(() => categories.id),
  brandId: uuid('brand_id').references(() => brands.id),
  createdAt: timestamp('created_at').defaultNow()
})

// Request Table
export const requests = pgTable('requests', {
  id: uuid('id')
    .unique()
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  shop: text('shop').notNull(),
  email: text('email').notNull(),
  phone: text('phone').notNull(),
  productId: uuid('product_id').references(() => products.id),
  ramId: uuid('ram_id').references(() => rams.id),
  conditionId: uuid('condition_id').references(() => conditions.id),
  createdAt: timestamp('created_at').defaultNow()
})

// Categories Table
export const categories = pgTable('categories', {
  id: uuid('id')
    .unique()
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  name: text('name').notNull(),
  createdAt: timestamp('created_at').defaultNow()
})

// Brands Table
export const brands = pgTable('brands', {
  id: uuid('id')
    .unique()
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  name: text('name').notNull(),
  createdAt: timestamp('created_at').defaultNow()
})

// RAM Table
export const rams = pgTable('ram', {
  id: uuid('id')
    .unique()
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  count: integer('count').notNull(), // RAM size in GB
  productId: uuid('product_id').references(() => products.id),
  createdAt: timestamp('created_at').defaultNow()
})

// Conditions Table
export const conditions = pgTable('conditions', {
  id: uuid('id')
    .unique()
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  type: text('type').notNull(),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  ramId: uuid('ram_id').references(() => rams.id),
  createdAt: timestamp('created_at').defaultNow()
})

// Define relations
export const productsRelations = relations(products, ({ one, many }) => ({
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.id]
  }),
  brand: one(brands, {
    fields: [products.brandId],
    references: [brands.id]
  }),
  rams: many(rams)
}))

export const requestRelations = relations(requests, ({ one, many }) => ({
  product: one(products, {
    fields: [requests.productId],
    references: [products.id]
  }),
  ram: one(rams, {
    fields: [requests.ramId],
    references: [rams.id]
  }),
  condition: one(conditions, {
    fields: [requests.conditionId],
    references: [conditions.id]
  })
}))

export const ramRelations = relations(rams, ({ one, many }) => ({
  product: one(products, {
    fields: [rams.productId],
    references: [products.id]
  }),
  conditions: many(conditions)
}))

export const conditionsRelations = relations(conditions, ({ one }) => ({
  ram: one(rams, {
    fields: [conditions.ramId],
    references: [rams.id]
  })
}))
