import { useMemo, useRef } from "react";
import { createPortal } from "react-dom";

import { BoardColumn, BoardContainer } from "./BoardColumn";
import {
  DndContext,
  type DragEndEvent,
  type DragOverEvent,
  DragOverlay,
  type DragStartEvent,
  useSensor,
  useSensors,
  KeyboardSensor,
  Announcements,
  UniqueIdentifier,
  TouchSensor,
  MouseSensor,
} from "@dnd-kit/core";
import { SortableContext, arrayMove } from "@dnd-kit/sortable";
import { type Task, TaskCard } from "./TaskCard";
// import type { Column } from "./BoardColumn";
import { hasDraggableData } from "./utils";
import { coordinateGetter } from "./multipleContainersKeyboardPreset";
import { useTaskContext } from './TaskContext';

export function KanbanBoard() {
  const { tasks, setTasks, columns, setColumns, activeColumn, setActiveColumn, activeTask, setActiveTask, handleChangeTask } = useTaskContext();
  const pickedUpTaskColumn = useRef<string | null>(null);
  const columnsId = useMemo(() => columns.map((col) => col.id), [columns]);

  const sensors = useSensors(
    useSensor(MouseSensor),
    useSensor(TouchSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: coordinateGetter,
    })
  );

  function getDraggingTaskData(taskId: UniqueIdentifier, columnId: UniqueIdentifier) {
    const tasksInColumn = tasks.filter((task) => task.columnId === columnId);
    const taskPosition = tasksInColumn.findIndex((task) => task.id === taskId);
    const column = columns.find((col) => col.id === columnId);
    return {
      tasksInColumn,
      taskPosition,
      column,
    };
  }

  const announcements: Announcements = {
    // Déclenche lorsque l'on commence à déplacer un élément
    onDragStart({ active }) {
      if (!hasDraggableData(active)) return;
      if (active.data.current?.type === "Column") { // Si on commence à déplacer une colonne
        const startColumnIdx = columnsId.findIndex((id) => id === active.id);
        const startColumn = columns[startColumnIdx];
        return `Picked up Column ${startColumn?.title} at position: ${
          startColumnIdx + 1
        } of ${columnsId.length}`;
      } else if (active.data.current?.type === "Task") { // Si on commence à déplacer une tâche
        if (pickedUpTaskColumn.current !== null) {
          const { tasksInColumn, taskPosition, column } = getDraggingTaskData(
            active.id,
            pickedUpTaskColumn.current
          );
          return `Picked up Task ${
            active.data.current.task.description
          } at position: ${taskPosition + 1} of ${
            tasksInColumn.length
          } in column ${column?.title}`;
        }
      }
    },
    // Déclenche lorsque l'on déplace un élément
    onDragOver({ active, over }) {
      if (!hasDraggableData(active) || !hasDraggableData(over)) return;
     
      if (
        // Si on déplace une colonne sur une autre colonne
        active.data.current?.type === "Column" &&
        over.data.current?.type === "Column"
      ) {
        // On récupère l'index de la colonne sur laquelle on déplace
        const overColumnIdx = columnsId.findIndex((id) => id === over.id);
        return `Column ${active.data.current.column.title} was moved over ${
          over.data.current.column.title
        } at position ${overColumnIdx + 1} of ${columnsId.length}`;
      } else if (
        // Si on déplace une tâche sur une autre tâche
        active.data.current?.type === "Task" &&
        over.data.current?.type === "Task"
      ) {
        // On récupère les données de la tâche sur laquelle on déplace
        const { tasksInColumn, taskPosition, column } = getDraggingTaskData(
          over.id,
          over.data.current.task.columnId
        );
        if (over.data.current.task.columnId !== pickedUpTaskColumn.current) {
          // Si la colonne de la tâche sur laquelle on déplace est différente de la colonne de la tâche sur laquelle on déplace
          return `Task ${
            active.data.current.task.description
          } was moved over column ${column?.title} in position ${
            taskPosition + 1
          } of ${tasksInColumn.length}`;
        }
        // Si la colonne de la tâche sur laquelle on déplace est la même que la colonne de la tâche sur laquelle on déplace
        return `Task was moved over position ${taskPosition + 1} of ${
          tasksInColumn.length
        } in column ${column?.title}`;
      }
    },
    // Déclenche lorsque l'on arrête de déplacer un élément
    onDragEnd({ active, over }) {
      // Déclenche lorsque l'on arrête de déplacer un élément
      if (!hasDraggableData(active) || !hasDraggableData(over)) {
        pickedUpTaskColumn.current = null;
        return;
      }
      if (
        // Si on arrête de déplacer une colonne
        active.data.current?.type === "Column" &&
        over.data.current?.type === "Column"
      ) {
        // On récupère l'index de la colonne sur laquelle on arrête de déplacer
        const overColumnPosition = columnsId.findIndex((id) => id === over.id);

        return `Column ${
          active.data.current.column.title
        } was dropped into position ${overColumnPosition + 1} of ${
          columnsId.length
        }`;
      } else if (
        // Si on arrête de déplacer une tâche
        active.data.current?.type === "Task" &&
        over.data.current?.type === "Task"
      ) {
        // On récupère les données de la tâche sur laquelle on arrête de déplacer
        const { tasksInColumn, taskPosition, column } = getDraggingTaskData(
          over.id,
          over.data.current.task.columnId
        );
        if (over.data.current.task.columnId !== pickedUpTaskColumn.current) {
          // Si la colonne de la tâche sur laquelle on arrête de déplacer est différente de la colonne de la tâche sur laquelle on déplace
          return `Task was dropped into column ${column?.title} in position ${
            taskPosition + 1
          } of ${tasksInColumn.length}`;
        }
        // Si la colonne de la tâche sur laquelle on arrête de déplacer est la même que la colonne de la tâche sur laquelle on déplace
        return `Task was dropped into position ${taskPosition + 1} of ${
          tasksInColumn.length
        } in column ${column?.title}`;
      }
      pickedUpTaskColumn.current = null;
    },
    // Déclenche lorsque l'on annule le déplacement d'un élément
    onDragCancel({ active }) {
      // Déclenche lorsque l'on annule le déplacement d'un élément
      pickedUpTaskColumn.current = null;
      if (!hasDraggableData(active)) return;
      return `Dragging ${active.data.current?.type} cancelled.`;
    },
  };

  return (
    <>
      <DndContext
        accessibility={{
          announcements,
        }}
        sensors={sensors}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        onDragOver={onDragOver}
      >
        <BoardContainer>
          <SortableContext items={columnsId}>
            {columns.map((col) => (
                <BoardColumn
                  key={col.id}
                  column={col}
                  tasksColumn={tasks.filter((task) => task.columnId === col.id)}
                />
              )
            )}
          </SortableContext>
        </BoardContainer>

        {"document" in window &&
          createPortal(
            <DragOverlay>
              {activeColumn && (
                <BoardColumn
                  isOverlay
                  column={activeColumn}
                  tasksColumn={tasks.filter(
                    (task) => task.columnId === activeColumn.id
                  )}
                />
              )}
              {activeTask && <TaskCard task={activeTask} isOverlay/>}
            </DragOverlay>,
            document.body
          )}
      </DndContext>
    </>
  );

  function onDragStart(event: DragStartEvent) {
    if (!hasDraggableData(event.active)) return;
    const data = event.active.data.current;
    if (data?.type === "Column") {
      setActiveColumn(data.column);
      return;
    }

    if (data?.type === "Task") {      
      setActiveTask(data.task);
      return;
    }
  }

  function onDragEnd(event: DragEndEvent) {
    
    setActiveColumn(null);
    setActiveTask(null);

    const { active, over } = event;
    if (!over) return;
    
    const activeId = active.id;
    const overId = over.id;

    if (!hasDraggableData(active)) return;

    const activeData = active.data.current;

    activeData && handleChangeTask(activeData.task)

    if (activeId === overId) return;

    const isActiveAColumn = activeData?.type === "Column";
    if (!isActiveAColumn) return;

    setColumns((columns) => {
      const activeColumnIndex = columns.findIndex((col) => col.id === activeId);

      const overColumnIndex = columns.findIndex((col) => col.id === overId);

      return arrayMove(columns, activeColumnIndex, overColumnIndex);
    });

  }

  function onDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over) return;
    const activeId = active.id;
    const overId = over.id;
    
    if (activeId === overId) return;

    if (!hasDraggableData(active) || !hasDraggableData(over)) return;

    const activeData = active.data.current;
    const overData = over.data.current;

    const isActiveATask = activeData?.type === "Task";
    const isOverATask = overData?.type === "Task";

    if (!isActiveATask) return;

    // Im dropping a Task over another Task
    if (isActiveATask && isOverATask) {
      setTasks((tasks) => {
        const activeIndex = tasks.findIndex((t) => t.id === activeId);
        const overIndex = tasks.findIndex((t) => t.id === overId);
        const activeTask = tasks[activeIndex];
        const overTask = tasks[overIndex];
        if (
          activeTask &&
          overTask &&
          activeTask.columnId !== overTask.columnId
        ) {
          activeTask.columnId = overTask.columnId;
          return arrayMove(tasks, activeIndex, overIndex - 1);
        }

        return arrayMove(tasks, activeIndex, overIndex);
      });
    }

    const isOverAColumn = overData?.type === "Column";

    // Im dropping a Task over a column
    if (isActiveATask && isOverAColumn) {
      setTasks((tasks) => {
        const activeIndex = tasks.findIndex((t) => t.id === activeId);
        const activeTask = tasks[activeIndex];
        if (activeTask) {
          activeTask.columnId = overId;
          return arrayMove(tasks, activeIndex, activeIndex);
        }
        return tasks;
      });
    }
  }
}