import { forwardRef, useLayoutEffect, useRef, useState } from "react";

interface AdaptiveInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const AdaptiveInput = forwardRef<HTMLInputElement, AdaptiveInputProps>(
  ({ className = "", ...props }, ref) => {
    const [inputWidth, setInputWidth] = useState(20);
    const phantomRef = useRef<HTMLSpanElement>(null);

    useLayoutEffect(() => {
      if (phantomRef.current) {
        const width = phantomRef.current.offsetWidth;
        setInputWidth(width);
      }
    }, [props.value]);

    return (
      <div
        className="relative"
        style={{
          width: inputWidth == 0 ? "100%" : `${inputWidth}px`,
        }}
      >
        <span
          ref={phantomRef}
          className="absolute opacity-0 pointer-events-none whitespace-pre"
          style={{
            font: "inherit",
            fontSize: "inherit",
          }}
        >
          {props.value || props.placeholder || ""}
        </span>
        <input
          {...props}
          ref={ref}
          className={`standard-input ${className}`}
          style={{
            width: "100%",
            textAlign: "left",
            outline: "none",
            ...props.style,
          }}
        />
      </div>
    );
  }
);

AdaptiveInput.displayName = "AdaptiveInput";

export default AdaptiveInput;
