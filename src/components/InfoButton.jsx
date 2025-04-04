import React from "react";

function InfoButton() {
  return (
    <div className="info-button">
      <button className="info-icon">❓</button>
      <div className="info-tooltip">
        <h3>使用须知</h3>
        <p>
          目前针对杯子能否被容纳的检测，有时存在滞后性，尤其是涉及杯子移动旋转的组合操作与键盘输入时
        </p>
        <p>
          因此当发现检测效果与视觉效果明显不符时，请尝试调整杯子的旋转或者移动，然后再改回来
        </p>
        <p>
          比如移动杯子位置时，视觉上可以容纳，但是检测结果不能容纳，请转动一个角度后再转回来，即刷新检测结果
        </p>
        <p>鼠标滚轮缩放，左键转动视角，右键移动物体</p>
        <p>检测结果仅供参考</p>
      </div>
    </div>
  );
}

export default InfoButton;
