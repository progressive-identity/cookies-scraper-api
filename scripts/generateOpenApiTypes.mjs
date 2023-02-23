import path from 'path'
import { fileURLToPath } from 'url'
import * as fs from 'fs'
import openapiTS from 'openapi-typescript'


const getAbsolutePath = (relativePath) => {
  const filename = fileURLToPath(import.meta.url)
  const dirname = path.dirname(filename)
  return path.join(dirname, relativePath)
}

;(async function () {
  try {
    console.log('Start openapi type generation')

    // https://www.npmjs.com/package/openapi-typescript
    const typeLegalDocumentGenerator = await openapiTS(getAbsolutePath('../openapi/v1/cookies-scraper.json'), {
      // If you get SyntaxError: An enum member name must be followed by a ',', '=', or '}'.
      // You need to rename the operationId of your endpoint using camelCase
      // instead of kebab-case
      // https://github.com/drwpow/openapi-typescript/issues/934

      // For now, this functionality doesn't seem to work properly in version 6.1.0
      // pathParamsAsTypes: true,
      supportArrayLength: true,
    })

    await fs.promises.writeFile(
      getAbsolutePath('../types/cookies-scraper.openapi-types.ts'),
      typeLegalDocumentGenerator
    )

    console.log('Type generation successful')
  } catch (err) {
    console.log(err)
  }
})()
