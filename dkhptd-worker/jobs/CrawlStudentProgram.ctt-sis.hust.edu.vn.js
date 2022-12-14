const {
  BringToFront,
  GoTo,
  WaitForTimeout,
  BreakPoint,
  ScreenShot,
  TypeIn,
  Click,
  GetValueFromParams,
  CurrentUrl,
  GetTextContent,
  PageEval,
  If,
  IsEqual,
  Job,
  Break,
} = require("puppeteer-worker-job-builder");
const HustCaptchaToText = require("./builders/HustCaptchaToText");

const LOGIN_URL = "https://ctt-sis.hust.edu.vn/Account/Login.aspx";
const LOGOUT_URL = "https://ctt-sis.hust.edu.vn/Account/Logout.aspx";
const STUDENT_PROGRAM_URL = "https://ctt-sis.hust.edu.vn/Students/StudentProgram.aspx";
const SAVE_CAPTCHA_TO = "./tmp/temp.png";

const CrawlStudentProgramHandler = () => {
  // note: browser scope not nodejs scope
  const selector = "#ctl00_ctl00_contentPane_MainPanel_MainContent_ProgramCoursePanel_gvStudentProgram_DXMainTable";
  // eslint-disable-next-line no-undef
  const table = document.querySelector(selector);
  const rows = table.querySelectorAll(".dxgvDataRow");
  const result = Array.from(rows).map((row) => {
    const values = Array.from(row.querySelectorAll(".dxgv"))
      .map((col) => col.textContent)
      .map((col) => col.trim().replace(/\s{2,}/g, " "));
    return {
      MaHocPhan: values[2],
      TenHocPhan: values[3],
      KyHoc: values[4],
      BatBuoc: values[5],
      TinChiDaoTao: values[6],
      TinChiHoc: values[7],
      MaHocPhanHoc: values[8],
      LoaiHocPhan: values[9],
      DiemChu: values[10],
      DiemSo: values[11],
      KhoaVien: values[12],
    };
  });
  return result;
};

module.exports = () => new Job({
  name: "CrawlStudentProgram",
  actions: [
    BringToFront(),
    GoTo(LOGIN_URL),
    WaitForTimeout(1000),
    Click("#ctl00_ctl00_contentPane_MainPanel_MainContent_rblAccountType_RB0"),
    Click("#ctl00_ctl00_contentPane_MainPanel_MainContent_tbUserName_I", { clickCount: 3 }),
    TypeIn("#ctl00_ctl00_contentPane_MainPanel_MainContent_tbUserName_I", GetValueFromParams((p) => p.username)),
    TypeIn("#ctl00_ctl00_contentPane_MainPanel_MainContent_tbPassword_I_CLND", GetValueFromParams((p) => p.password)),
    ScreenShot("#ctl00_ctl00_contentPane_MainPanel_MainContent_ASPxCaptcha1_IMG", SAVE_CAPTCHA_TO, "png"),
    TypeIn("#ctl00_ctl00_contentPane_MainPanel_MainContent_ASPxCaptcha1_TB_I", HustCaptchaToText(SAVE_CAPTCHA_TO, "http://localhost:8000")),
    Click("#ctl00_ctl00_contentPane_MainPanel_MainContent_btLogin_CD"),
    WaitForTimeout(3000),
    If(IsEqual(CurrentUrl(), LOGIN_URL /* van o trang dang nhap */)).Then([
      GetTextContent("#ctl00_ctl00_contentPane_MainPanel_MainContent_FailureText"), /* sai tai khoan */
      GetTextContent("#ctl00_ctl00_contentPane_MainPanel_MainContent_ASPxCaptcha1_TB_EC"), /* sai captcha */
      Break(),
    ]).Else([
      GoTo(STUDENT_PROGRAM_URL),
      PageEval(CrawlStudentProgramHandler),
      GoTo(LOGOUT_URL),
      Break(),
    ]),
  ],
});
