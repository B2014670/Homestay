import React,{ memo } from "react";


const Button = ({ text, textColor, bgColor, IcAfter,onClick,fullwidth }) => {
  return (
    <button
      type="button"
      className={`py-2 px-4 ${textColor} ${bgColor} ${ fullwidth && 'w-full'} outline-none rounded-md hover:underline flex items-center justify-center`}
      onClick={onClick}
    >
      <div className="flex items-center gap-1">
        
        <span className="">{text}</span>
        <span>{IcAfter && <IcAfter  size="18px" />}</span>
      </div>
    </button>
  );
};

export default memo(Button);
