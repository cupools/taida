import Progress from 'progress'

export default function (total) {
  // TODO disable display progress
  const bar = new Progress('  Compression [:bar] :percent', {
    incomplete: ' ',
    width: 20,
    total
  })

  // show the process bar immediately
  bar.tick(0)

  return bar
}
