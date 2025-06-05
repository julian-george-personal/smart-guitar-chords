import { useCallback } from "react";
import { RxMinus, RxPlus } from "react-icons/rx";
import { processInputString } from "../util";

type MultiStringInputProps = {
  values: string[];
  onChange: (values: string[]) => void;
};

export default function MultiStringInput({
  values,
  onChange,
}: MultiStringInputProps) {
  const insertStringValue = useCallback(() => {
    onChange(values.concat([""]));
  }, [onChange, values]);
  const updateStringValue = useCallback(
    (stringIdx: number, newValue: string) =>
      onChange(
        values.map((prevValue, i) =>
          i == stringIdx ? processInputString(newValue) : prevValue
        )
      ),
    [onChange, values]
  );
  const deleteString = useCallback(
    (stringIdx: number) => onChange(values.toSpliced(stringIdx, 1)),
    [onChange, values]
  );
  return (
    <div className="flex flex-row gap-2 items-center max-w-[32rem] flex-wrap">
      {values.map((stringValue, i) => (
        <div
          key={i}
          className="relative inline-block w-fit flex flex-row items-center standard-input"
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
