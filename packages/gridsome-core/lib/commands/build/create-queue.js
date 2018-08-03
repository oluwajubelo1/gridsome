const Queue = require('better-queue')

module.exports = (items, options, taskHandler) => {
  if (typeof options === 'function') {
    taskHandler = options
    options = {}
  }

  const total = items.length
  const queue = new Queue(taskHandler, {
    concurrent: options.concurrent || 10
  })

  for (let i = 0, l = total; i < l; i++) {
    queue.push({ id: `data[${i}]`, data: items[i] })
  }

  printProgress(0)

  return new Promise((resolve, reject) => {
    let done = 0

    queue.on('task_finish', (id, result, stats) => {
      resetConsoleLine()
      printProgress(done++)
    })

    queue.on('task_failed', (id, err) => {
      reject(`${id} failed with error: ${err}`)
      resetConsoleLine()
      queue.destroy()
    })

    queue.on('drain', () => {
      resetConsoleLine()
      resolve()
    })
  })

  function printProgress (done) {
    const progress = Math.ceil((done / total) * 100)
    process.stdout.write(` ${progress}% ${options.label}`)
  }

  function resetConsoleLine () {
    process.stdout.clearLine()
    process.stdout.cursorTo(0)
  }
}

