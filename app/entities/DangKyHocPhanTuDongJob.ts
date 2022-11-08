import { ObjectId } from "mongodb";
import toObjectId from "../dto/toObjectId";
import DropProps from "../modifiers/DropProps";
import ObjectModifer from "../modifiers/ObjectModifier";
import EntityWithObjectId from "./EntityWithObjectId";
import JobStatus from "./JobStatus";

export default class DangKyHocPhanTuDongJob extends EntityWithObjectId {
  ownerAccountId: ObjectId;
  username: string;
  password: string;
  classIds: string[];
  timeToStart: number;
  status: number;
  createdAt: number;
  doingAt: number;

  constructor({ _id, username, password, classIds, timeToStart, ownerAccountId, status, createdAt, doingAt }: any) {
    super();
    this._id = _id;
    this.ownerAccountId = ownerAccountId;
    this.username = username;
    this.password = password;
    this.classIds = classIds;
    this.timeToStart = timeToStart;
    this.status = status;
    this.createdAt = createdAt;
    this.doingAt = doingAt;
  }

  withOwnerAccountId(id: string | ObjectId) {
    this.ownerAccountId = toObjectId(id);
    return this;
  }

  toClient() {
    const output = new ObjectModifer(this)
      .modify(DropProps(["password"]))
      .collect();
    return output;
  }

  toRetry() {
    const output = new DangKyHocPhanTuDongJob(this);
    output._id = null;
    output.status = JobStatus.READY;
    output.doingAt = null;
    output.createdAt = Date.now();
    return output;
  }
}
