const { EVENT_NAMES } = require('../constants.js')

/**
 * Process the daily job to calculate and update daily metrics
 */
module.exports = async function dailyMetricsJob(prisma) {
  try {
    const [dailyInstancesNb, dailyActiveInstancesNb, dailyUtterancesNb, dailySetupsNb, dailyOnlineInstanceNb] = await Promise.all([
      // Count instances that have been created in the last 24 hours
      prisma.instance.count({
        where: {
          createdAt: {
            gte: new Date(new Date().setUTCHours(0, 0, 0, 0))
          }
        }
      }),
      // Count instances that have sent at least 1 utterance in the last 30 days
      prisma.instance.count({
        where: {
          utterances: {
            some: {
              createdAt: {
                gte: new Date(new Date().setDate(new Date().getDate() - 30))
              }
            }
          }
        }
      }),
      // Count instances that have sent at least 1 utterance in the last 24 hours
      prisma.utterance.count({
        where: {
          createdAt: {
            gte: new Date(new Date().setUTCHours(0, 0, 0, 0))
          }
        }
      }),
      // Count instances that have sent a SETUP event in the last 24 hours
      prisma.event.count({
        where: {
          name: EVENT_NAMES.SETUP,
          createdAt: {
            gte: new Date(new Date().setUTCHours(0, 0, 0, 0))
          }
        }
      }),
      // Count instances that have sent at least 1 heartbeat in the last 24 hours
      prisma.instance.count({
        where: {
          events: {
            some: {
              name: EVENT_NAMES.HEARTBEAT,
              createdAt: {
                gte: new Date(new Date().setUTCHours(0, 0, 0, 0))
              }
            }
          }
        }
      })
    ])

    // Set "isOnline" to false for all instances that haven't sent a heartbeat in the last 24 hours
    await prisma.instance.updateMany({
      where: {
        events: {
          every: {
            createdAt: {
              lt: new Date(new Date().setUTCHours(0, 0, 0, 0))
            }
          }
        }
      },
      data: {
        isOnline: false
      }
    })

    const dailyMetric = await prisma.dailyMetric.create({
      data: {
        instancesNb: dailyInstancesNb,
        activeInstancesNb: dailyActiveInstancesNb,
        utterancesNb: dailyUtterancesNb,
        setupsNb: dailySetupsNb,
        onlineInstancesNb: dailyOnlineInstanceNb
      }
    })

    return Promise.resolve(dailyMetric)
  } catch (e) {
    console.error('Failed to process the dailyMetrics job:', e)
  }
}
