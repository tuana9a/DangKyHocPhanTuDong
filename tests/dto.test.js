const SetProp = require("../app/dto/SetProp");
const JobStatus = require("../app/entities/JobStatus");
const NormalizeArrayProp = require("../app/modifiers/NormalizeArrayProp");
const NormalizeIntProp = require("../app/modifiers/NormalizeIntProp");
const NormalizeStringProp = require("../app/modifiers/NormalizeStringProp");
const ObjectModifer = require("../app/modifiers/ObjectModifier");
const PickProps = require("../app/modifiers/PickProps");
const extractClassIds = require("../app/utils/extractClassIds");

describe("dto", () => {
  test("NewDangKyHocPhanTuDongJob", () => {
    const now = new Date();
    const received = new ObjectModifer([
      PickProps(["username", "password", "classIds", "timeToStart"]),
      NormalizeStringProp("username"),
      NormalizeStringProp("password"),
      NormalizeArrayProp("classIds", "string", ""),
      NormalizeIntProp("timeToStart"),
      SetProp("createdAt", now.getTime()),
      SetProp("status", JobStatus.READY),
      // TODO: inject ownerAccountId
    ]).apply({
      propWillBeDrop: "hello",
      username: "u ",
      password: " p  ",
      timeToStart: now.getTime(),
      actionId: "getStudentTimetable  ",
      status: "this status will be drop",
      created: "this created will be drop too",
    });

    const expected = {
      username: "u",
      password: "p",
      timeToStart: now.getTime(),
      status: JobStatus.READY,
      createdAt: now.getTime(),
    };
    expect(received).toEqual(expected);
  });

  test("extract class ids like I wanted", () => {
    expect(extractClassIds("1,2,3,4")).toEqual(["1", "2", "3", "4"]);
    expect(extractClassIds(" 1, 2 ,  3 ,  4  ")).toEqual(["1", "2", "3", "4"]);
    expect(extractClassIds("1,,3,4")).toEqual(["1", "3", "4"]);
  });
});