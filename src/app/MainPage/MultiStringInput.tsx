import {
  useCallback,
  useEffect,
  useState,
  Dispatch,
  SetStateAction,
} from "react";
import { RxMinus, RxPlus } from "react-icons/rx";
import { processInputString } from "../util";

type MultiStringInputProps = {
  values: string[];
  onChange: Dispatch<SetStateAction<string[]>>;
};

export default function MultiStringInput({
  values,
  onChange,
}: MultiStringInputProps) {
  const insertStringValue = useCallback(() => {
    onChange((prev) => prev.concat([""]));
  }, [onChange]);
  const updateStringValue = useCallback(
    (stringIdx: number, newValue: string) =>
      onChange((prev) =>
        prev.map((prevValue, i) =>
          i == stringIdx ? processInputString(newValue) : prevValue
        )
      ),
    [onChange]
  );
  const deleteString = useCallback(
    (stringIdx: number) => onChange((prev) => prev.toSpliced(stringIdx, 1)),
    [onChange]
  );
  return (
    <div className="flex flex-row py-1 gap-2 items-center max-w-[32rem] flex-wrap">
      {values.map((stringValue, i) => (
        <div
          key={i}
          className="relative inline-block w-fit flex flex-row items-center bg-neutral-100 px-2 py-1 "
        >
          <input
            className="w-16 bg-neutral-100"
            value={stringValue}
            onChange={({ target }) => {
              updateStringValue(i, target.value);
            }}
          />
          <RxMinus className="cursor-pointer" onClick={() => deleteString(i)} />
        </div>
      ))}
      <RxPlus className="cursor-pointer" onClick={insertStringValue} />
    </div>
  );
}
