import React from "react";

function Toolbar({
  cupRotation,
  setCupRotation,
  cupPosition,
  setCupPosition,
  boxWidth,
  setBoxWidth,
  boxHeight,
  setBoxHeight,
  boxDepth,
  setBoxDepth,
  isOverlapping,
  handleCheckFit,
  canFit,
}) {
  return (
    <div className="toolbar">
      <div className="control-group">
        <h3>杯子角度控制（度）</h3>
        <label>旋转角度：</label>
        <input
          type="number"
          value={((cupRotation * 180) / Math.PI).toFixed(1)}
          onChange={(e) =>
            setCupRotation((Number(e.target.value) * Math.PI) / 180)
          }
          step="1"
        />
      </div>

      {isOverlapping && (
        <div className="control-group">
          <h3>杯子位置控制（厘米）</h3>
          <label>左右移动：</label>
          <input
            type="number"
            value={cupPosition[0].toFixed(2)}
            onChange={(e) =>
              setCupPosition([
                Number(e.target.value),
                cupPosition[1],
                cupPosition[2],
              ])
            }
            step="0.1"
            min="-10"
            max="10"
          />
          <label>前后移动：</label>
          <input
            type="number"
            value={cupPosition[2].toFixed(2)}
            onChange={(e) =>
              setCupPosition([
                cupPosition[0],
                cupPosition[1],
                Number(e.target.value),
              ])
            }
            step="0.1"
            min="-10"
            max="10"
          />
        </div>
      )}

      <div className="control-group">
        <h3>盒子设置（厘米）</h3>
        <label>长度：</label>
        <input
          type="number"
          value={boxWidth}
          onChange={(e) => setBoxWidth(Number(e.target.value))}
          min="1"
          max="50"
          step="0.1"
        />
        <label>宽度：</label>
        <input
          type="number"
          value={boxDepth}
          onChange={(e) => setBoxDepth(Number(e.target.value))}
          min="1"
          max="50"
          step="0.1"
        />
        <label>高度：</label>
        <input
          type="number"
          value={boxHeight}
          onChange={(e) => setBoxHeight(Number(e.target.value))}
          min="1"
          max="50"
          step="0.1"
        />
      </div>

      <div className="control-group">
        <button className="check-button" onClick={handleCheckFit}>
          {isOverlapping ? "分离物体" : "检查是否合适"}
        </button>
        {isOverlapping && (
          <div className={`fit-status ${canFit ? "can-fit" : "cannot-fit"}`}>
            {canFit ? "😊 可以容纳" : "😞 无法容纳"}
          </div>
        )}
      </div>
    </div>
  );
}

export default Toolbar;
