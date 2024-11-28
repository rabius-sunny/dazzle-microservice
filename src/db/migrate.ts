import { drizzle } from 'drizzle-orm/neon-http'
import { neon } from '@neondatabase/serverless'
import { migrate } from 'drizzle-orm/neon-http/migrator'

const sql = neon(
  'postgresql://dazzle-exchange_owner:SqTZY9IgCLA7@ep-autumn-thunder-a11fsyou.ap-southeast-1.aws.neon.tech/dazzle-exchange?sslmode=require'
)

const db = drizzle(sql)

const main = async () => {
  try {
    await migrate(db, {
      migrationsFolder: 'drizzle'
    })
    console.log('DB Migration successfull')
  } catch (error) {
    console.error(error)
    process.exit(1)
  }
}

main()
