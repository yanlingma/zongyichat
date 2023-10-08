import { useState } from "react";
import styles from "./login.module.scss";
import { isEmailFormat, useFrameAnim, useMobileScreen } from "../utils";
import { useChatStore } from "../store";
import { useNavigate } from "react-router-dom";
import { IconButton } from "./button";
import { NormalBtn } from "./button";
import {
  FrameOver,
  Loading,
  ModalProps,
  Popover,
  showModal,
  showToast,
} from "./ui-lib";
import { Header } from "./header";
import { LoginResp, Post } from "../requests";
import ExitIcon from "../icons/return.svg";
import LoadingIcon from "../icons/three-dots.svg";
export function LoginPage() {
  let [account, SetAccount] = useState("");
  let [password, SetPassword] = useState("");
  const [loading, SetLoading] = useState(false);
  const { showAnim, navigateWrap } = useFrameAnim();
  const ismobile = useMobileScreen();

  let chatStore = useChatStore();

  // useLoading(false,SetLoading);
  let actions = [<></>];

  async function handleSubmit() {
    if (!isEmailFormat(account)) {
      // alert("请输入正确的邮箱账号")s
      showModal({
        title: "请输入正确的邮箱账号",
        // children:<NormalBtn text="确认"/>,
        // actions:[<NormalBtn text="确认"/>]
      } as ModalProps);
      return;
    }

    console.log("loginByE-mail");
    try {
      SetLoading(true);
      console.log(" requext login");
      let loginresp = await Post<LoginResp>(
        "https://etcms.ai.zongyigame.com/api/users/login",
        { email: account.trim(), password: password.trim() },
      );
      chatStore.updateUid(loginresp.user.id);
      chatStore.updateEmailData({
        account: account.trim(),
        passWord: password.trim(),
        exportTime: loginresp.exp,
      });
      setTimeout(() => {
        SetLoading(false);
        navigateWrap("/");
      }, 1000);
    } catch (error) {
      console.log(error);
      SetLoading(false);
      showToast("账号或密码错误");
    }
  }
  let style = "";
  if (ismobile) {
    style = styles["email"] + (showAnim ? " " + styles["email-show"] : "");
  } else {
    style = styles["email"] + " " + styles["email-show-dir"];
  }
  return (
    <div className={style}>
      <FrameOver content={<LoadingIcon />} onClose={() => {}} open={loading} />
      <Header mainTitle={"登录"} subTitle={"邮箱登录"} actionBtns={actions} />
      <div className={styles["email-input"]}>
        <input
          type="text"
          value={account}
          placeholder={"请输入电子邮箱"}
          className={styles["email-input-account"]}
          onChange={(value) => {
            SetAccount(value.target.value);
          }}
        />
        <input
          type="password"
          value={password}
          placeholder={"请输入密码"}
          className={styles["email-input-password"]}
          onChange={(val) => {
            SetPassword(val.target.value);
          }}
        />
        <NormalBtn
          btnClassName={styles["email-submit"]}
          textClassName={styles["email-submittext"]}
          text={"登录"}
          onClick={() => {
            handleSubmit();
          }}
        />
      </div>
    </div>
  );
}
