import { CronJob } from 'cron'
import artemis from '#helpers/artemis'

export class Schedullers {
  cronJob: CronJob

  constructor() {
    // Every at 5
    this.cronJob = new CronJob('0,5,10,15,20,25,30,35,40,45,50,55 * * * *', async () => {
      try {
        await artemis.SaveANPR_FaceRM()
      } catch (e) {
        throw new Error(e)
      }
    })
    // Start job
    if (!this.cronJob.running) {
      // this.cronJob.start()
    }
  }
}
