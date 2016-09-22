import main from '../index'
import log from '../utils/log'

export default function (...args) {
  return main(...args)
    .then(
      data => log.build(data.path)
    )
    .catch(
      error => log.error(error)
    )
}
