import fs from 'fs'
import path from 'path'

const DB_PATH = path.resolve('.apikey')

export default {
  add() {},
  get() {
    let option = {
      encoding: 'utf8'
    }

    try {
      return fs.readFileSync(DB_PATH, option)
    } catch (e) {
      fs.writeFileSync(DB_PATH, '', option)

      return null
    }
  },
  clear() {}
}
