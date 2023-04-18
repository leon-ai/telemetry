const path = require('node:path')

const dotenv = require('dotenv')
const Fastify = require('fastify')
const Queue = require('bull')
const { PrismaClient } = require('@prisma/client')
const uuid = require('uuid')

const { EVENT_NAMES } = require('./constants.js')
const dailyMetricsJob = require('./jobs/daily-metrics-job.js')

dotenv.config({
  path: path.join('.env')
})

const FASTIFY = Fastify({
  logger: false
})
const PRISMA = new PrismaClient()
const RESPONSES = {
  success: (reply) => {
    reply.type('application/json').code(200)
    return { success: true }
  },
  missingFields: (reply) => {
    reply.type('application/json').code(400)
    return { success: false, error: 'Missing required fields' }
  },
  instanceNotFound: (reply) => {
    reply.type('application/json').code(404)
    return { success: false, error: 'Instance not found' }
  },
  internalError: (reply, e) => {
    reply.type('application/json').code(500)
    return { success: false, error: String(e) }
  }
}

async function hasInstanceID(instanceID) {
  const instance = await PRISMA.instance.findUnique({
    where: {
      instanceID
    }
  })

  return instance !== null
}
function pushEvent(instanceID, eventName) {
  return PRISMA.event.create({
    data: {
      instanceID,
      name: EVENT_NAMES[eventName]
    }
  })
}

/**
 * Push new instance if it does not exist
 * Push new SETUP event
 */
FASTIFY.post('/on-post-install', async (request, reply) => {
  try {
    const instanceID = request.body.instanceID || uuid.v4()

    if (!await hasInstanceID(instanceID)) {
      await PRISMA.instance.create({
        data: {
          instanceID
        }
      })
    }

    await pushEvent(instanceID, EVENT_NAMES.SETUP)

    reply.type('application/json').code(200)
    return {
      success: true,
      instanceID,
      birthDate: Date.now()
    }
  } catch (e) {
    return RESPONSES.internalError(reply, e)
  }
})

FASTIFY.post('/on-start', async (request, reply) => {
  try {
    if (!request.body.instanceID || !request.body.data) {
      return RESPONSES.missingFields(reply)
    }

    const { instanceID, data } = request.body

    await PRISMA.instance.upsert({
      where: { instanceID },
      update: {
        ...data
      },
      create: {
        instanceID,
        ...data
      }
    })
    // Upsert first as the instance may not exist yet
    await pushEvent(instanceID, EVENT_NAMES.STARTED)

    return RESPONSES.success(reply)
  } catch (e) {
    return RESPONSES.internalError(reply, e)
  }
})

/**
 * Push new utterance data
 * Push new UTTERANCE event
 */
FASTIFY.post('/on-utterance', async (request, reply) => {
  try {
    if (!request.body.instanceID || !request.body.data) {
      return RESPONSES.missingFields(reply)
    }

    const { instanceID, data } = request.body

    if (!await hasInstanceID(instanceID)) {
      return RESPONSES.instanceNotFound(reply)
    }

    await Promise.all([
      PRISMA.utterance.create({
        data: {
          instanceID,
          ...data
        }
      }),
      pushEvent(instanceID, EVENT_NAMES.UTTERANCE)
    ])

    return RESPONSES.success(reply)
  } catch (e) {
    return RESPONSES.internalError(reply, e)
  }
})

/**
 * Push new event
 */
FASTIFY.post('/on-event', async (request, reply) => {
  try {
    if (!request.body.instanceID || !request.body.eventName) {
      return RESPONSES.missingFields(reply)
    }
    if (!Object.values(EVENT_NAMES).includes(request.body.eventName)) {
      reply.type('application/json').code(400)
      return { success: false, error: 'Invalid event name' }
    }

    const { instanceID, eventName } = request.body

    if (!await hasInstanceID(instanceID)) {
      return RESPONSES.instanceNotFound(reply)
    }

    if (eventName === EVENT_NAMES.STOPPED) {
      await PRISMA.instance.update({
        where: { instanceID },
        data: {
          isOnline: false
        }
      })
    }

    await pushEvent(instanceID, EVENT_NAMES[eventName])

    return RESPONSES.success(reply)
  } catch (e) {
    return RESPONSES.internalError(reply, e)
  }
})

/**
 * Push new error
 */
FASTIFY.post('/on-error', async (request, reply) => {
  try {
    if (!request.body.instanceID || !request.body.error) {
      return RESPONSES.missingFields(reply)
    }

    const { instanceID, error } = request.body

    if (!await hasInstanceID(instanceID)) {
      return RESPONSES.instanceNotFound(reply)
    }

    await PRISMA.error.create({
      data: {
        instanceID,
        message: error
      }
    })

    return RESPONSES.success(reply)
  } catch (e) {
    return RESPONSES.internalError(reply, e)
  }
})

FASTIFY.listen({
  host: process.env.SERVER_HOST,
  port: process.env.SERVER_PORT
}, async (err, address) => {
  if (err) {
    throw err
  }

  try {
    const dailyMetricsQueue = new Queue('daily-metrics', {
      redis: {
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT
      }
    })

    const jobCounts = await dailyMetricsQueue.getJobCounts()
    console.log('daily-metrics jobs count:', jobCounts)

    await dailyMetricsQueue.clean(0, 'delayed')

    await dailyMetricsQueue.add(null, {
      repeat: {
        // Every day at midnight UTC
        cron: '0 0 * * *'
        // cron: '*/20 * * * * *'
      }
    })

    dailyMetricsQueue.process(() => {
      return dailyMetricsJob(PRISMA)
    })

    dailyMetricsQueue.on('error', (err) => {
      console.error('Error in daily metrics queue', err)
    })
    dailyMetricsQueue.on('waiting', (jobID) => {
      console.log('Daily metrics job waiting', jobID)
    })
    dailyMetricsQueue.on('active', (job) => {
      console.log('Daily metrics job started', job.id)
    })
    dailyMetricsQueue.on('completed', (job, result) => {
      console.log('Daily metrics job completed', result)
    })
  } catch (e) {
    console.error('Failed to init the daily metrics queue', e)
  }

  console.log(`Server is now listening on ${address}`)
})
