import { ObjectId } from "mongodb";
import cfg from "../cfg";
import AppEvent from "../configs/AppEvent";
import JobStatus from "../configs/JobStatus";
import mongoConnectionPool from "../connections/MongoConnectionPool";
import DKHPTDJobV2 from "../entities/DKHPTDJobV2";
import emitter from "../listeners/emiter";
import logger from "../loggers/logger";
import loop from "../utils/loop";

export default {
  setup() {
    loop.infinity(async () => {
      try {
        const cursor = mongoConnectionPool.getClient().db(cfg.DATABASE_NAME).collection(DKHPTDJobV2.name).find({
          timeToStart: { $lt: Date.now() }, /* less than now then it's time to run */
          status: JobStatus.READY,
        }, { sort: { timeToStart: 1 } });
        while (await cursor.hasNext()) {
          const entry = await cursor.next();
          const job = new DKHPTDJobV2(entry).decrypt();
          emitter.emit(AppEvent.NEW_JOB_V2, job.toWorker());
          await mongoConnectionPool.getClient()
            .db(cfg.DATABASE_NAME).collection(DKHPTDJobV2.name).updateOne({ _id: new ObjectId(job._id) }, {
              $set: {
                status: JobStatus.DOING,
                doingAt: Date.now(),
              },
            });
        }
      } catch (err) {
        logger.error(err);
      }
    }, 10_000);
  }
};