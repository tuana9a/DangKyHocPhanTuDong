import AppEvent from "../configs/AppEvent";
import QueueName from "../configs/QueueName";
import rabbitmqConnectionPool from "../connections/RabbitMQConnectionPool";
import emitter from "../listeners/emiter";
import logger from "../loggers/logger";

export default {
  setup() {
    rabbitmqConnectionPool.getChannel().assertQueue(QueueName.PROCESS_PARSE_TKB_XLSX_RESULT, {}, (error2, q) => {
      if (error2) {
        logger.error(error2);
        return;
      }

      rabbitmqConnectionPool.getChannel().consume(q.queue, async (msg) => {
        try {
          const result = JSON.parse(msg.content.toString());
          emitter.emit(AppEvent.TKB_XLSX_PARSED, result);
        } catch (err) {
          logger.error(err);
        }
        rabbitmqConnectionPool.getChannel().ack(msg);
      }, { noAck: false });
    });
  }
};