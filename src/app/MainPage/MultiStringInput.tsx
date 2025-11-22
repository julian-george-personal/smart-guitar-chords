import { useCallback } from "react";
import { RxMinus, RxPlus } from "react-icons/rx";
import { MdDragIndicator } from "react-icons/md";
import { processInputString, generateId } from "../util";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

type MultiStringInputValues = { [id: string]: { index: number; value: string } };

type MultiStringInputProps = {
  values: MultiStringInputValues;
  onChange: (values: MultiStringInputValues) => void;
};

type SortableChordInputProps = {
  id: string;
  value: string;
  onUpdate: (id: string, newValue: string) => void;
  onDelete: (id: string) => void;
};

function SortableChordInput({ id, value, onUpdate, onDelete }: SortableChordInputProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="relative inline-block w-fit flex flex-row items-center standard-input"
    >
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing px-1"
        style={{ touchAction: "none" }}
      >
        <MdDragIndicator className="w-4 h-4 text-gray-500" />
      </div>
      <input
        className="w-16 bg-neutral-100"
        value={value}
        onChange={({ target }) => {
          onUpdate(id, target.value);
        }}
      />
      <RxMinus className="cursor-pointer" onClick={() => onDelete(id)} />
    </div>
  );
}

export default function MultiStringInput({
  values,
  onChange,
}: MultiStringInputProps) {
  // Convert object to array sorted by index for rendering
  const sortedEntries = Object.entries(values)
    .map(([id, data]) => ({ id, ...data }))
    .sort((a, b) => a.index - b.index);

  const sortedIds = sortedEntries.map((entry) => entry.id);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Require 8px movement before drag starts
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;

      if (over && active.id !== over.id) {
        const oldIndex = sortedIds.indexOf(active.id as string);
        const newIndex = sortedIds.indexOf(over.id as string);

        const reorderedIds = arrayMove(sortedIds, oldIndex, newIndex);

        // Recalculate indices based on new order
        const newValues: MultiStringInputValues = {};
        reorderedIds.forEach((id, index) => {
          newValues[id] = { ...values[id], index };
        });

        onChange(newValues);
      }
    },
    [sortedIds, values, onChange]
  );

  const insertStringValue = useCallback(() => {
    const newId = generateId();
    const maxIndex = Math.max(...Object.values(values).map((v) => v.index), -1);
    const newValues = {
      ...values,
      [newId]: { index: maxIndex + 1, value: "" },
    };
    onChange(newValues);
  }, [onChange, values]);

  const updateStringValue = useCallback(
    (id: string, newValue: string) => {
      const newValues = {
        ...values,
        [id]: { ...values[id], value: processInputString(newValue) },
      };
      onChange(newValues);
    },
    [onChange, values]
  );

  const deleteString = useCallback(
    (id: string) => {
      const newValues = { ...values };
      delete newValues[id];
      onChange(newValues);
    },
    [onChange, values]
  );

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <div className="flex flex-row gap-2 items-center max-w-[32rem] flex-wrap">
        <SortableContext items={sortedIds} strategy={rectSortingStrategy}>
          {sortedEntries.map(({ id, value }) => (
            <SortableChordInput
              key={id}
              id={id}
              value={value}
              onUpdate={updateStringValue}
              onDelete={deleteString}
            />
          ))}
        </SortableContext>
        <RxPlus className="cursor-pointer" onClick={insertStringValue} />
      </div>
    </DndContext>
  );
}
