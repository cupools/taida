import Progress from 'progress'
import emitter from './emitter'

let bar = null

emitter.on('bar.init', total => {
  bar = new Progress('  Compression [:bar] :percent', {
    incomplete: ' ',
    width: 20,
    total
  })

  bar.tick(0)
})

emitter.on('bar.progress', () => {
  if (!bar) return
  bar.tick()
})
