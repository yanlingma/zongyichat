import styles from "./window.module.scss";
export function Header(props: {
  mainTitle: string;
  subTitle?: string;
  actionBtns: JSX.Element[];
}) {
  return (
    <div className={styles["window-header"]}>
      <div className="window-header-title">
        <div className="window-header-main-title">{props.mainTitle}</div>

        <div className="window-header-sub-title">
          {props.subTitle != null ? (
            <div className="window-header-sub-title">{props.subTitle}</div>
          ) : (
            ""
          )}
        </div>
      </div>
      <div className={styles["window-actions"]}>
        {props.actionBtns.map((item, i) => (
          <div className="window-action-button" key={i}>
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}
