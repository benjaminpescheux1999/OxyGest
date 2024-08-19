// import type { UniqueIdentifier } from "@dnd-kit/core";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cva } from "class-variance-authority";
import { GripVertical } from "lucide-react";
import { Badge } from "./ui/badge";
import { useState } from "react";
import Modal from "./ui/modal"; // Assurez-vous que le chemin d'importation est correct
import { MenuDial } from "./ui/menudial";
import { useTaskContext, ColumnId } from './TaskContext';
import { statusLabels } from "@/constante";
import { decodeHtml, convertToPlain } from "./ui/react-quilljs";
import IUser from './types/user';

export interface Task {
  id: string;
  columnId: ColumnId;
  description: string;
  name: string;
  visible: boolean;
  status: number;
  // users: IUser[];
  applicants?: IUser[];
  observers?: IUser[];
  attributedTo?: IUser[];
}

interface TaskCardProps {
  task: Task;
  isOverlay?: boolean;
}

export type TaskType = "Task";

export interface TaskDragData {
  type: TaskType;
  task: Task;
}

export function TaskCard({ task, isOverlay }: TaskCardProps) {
  const [isModalOpen, setModalOpen] = useState(false);
  const toggleModal = () => setModalOpen(!isModalOpen);
  const { handleDeleteTask } = useTaskContext();

  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: {
      type: "Task",
      task,
    } satisfies TaskDragData,
    attributes: {
      roleDescription: "Task",
    },
  });

  const style = {
    cursor: "pointer",
    transition,
    transform: CSS.Translate.toString(transform),
  };

  const variants = cva("", {
    variants: {
      dragging: {
        over: "ring-2 opacity-30",
        overlay: "ring-2 ring-primary",
      },
    },
  });
  // deletedTask("2");
  return (
    <>
      <Card
        ref={setNodeRef}
        style={{
          ...style,
          height: task.visible ? undefined : '0px',
          visibility: task.visible ? undefined : 'hidden'
        }}
        className={variants({
          dragging: isOverlay ? "overlay" : isDragging ? "over" : undefined,
        })}
        onClick={toggleModal} // Ajout de l'écouteur d'événement pour ouvrir la modal
      >
        <CardHeader className="space-y-1.5 p-4 font-semibold border-b-2 text-left flex flex-row justify-between items-center w-full py-1.5">
            <Button
              variant={"ghost"}
              {...attributes}
              {...listeners}
              className="p-1 text-secondary-foreground/50 h-auto cursor-grab"
            >
              <span className="sr-only">Move task</span>
              <GripVertical />
            </Button>
            <div className="flex-grow text-center">
              <Badge variant={"outline"} className="font-semibold">
                {statusLabels[task.status]}
              </Badge>
            </div>
            <MenuDial task={task} view={toggleModal}/>
        </CardHeader>
        <CardContent className="px-3 pt-3 pb-6 text-left whitespace-pre-wrap">
          <h3 className="text-lg font-semibold">{task.name}</h3>
          <div dangerouslySetInnerHTML={{ __html: decodeHtml(task.description) }} />
          {(task.applicants && task.applicants.length > 0 || task.observers && task.observers.length > 0 || task.attributedTo && task.attributedTo.length > 0) && (
            <div className="flex -space-x-4 rtl:space-x-reverse float-right">
              {Array.from(new Set([...(task.applicants ?? []), ...(task.observers ?? []), ...(task.attributedTo ?? [])].map(user => user.id)))
                .map(userId => {
                  const user = (task.applicants ?? []).concat(task.observers ?? [], task.attributedTo ?? []).find(user => user.id === userId);
                  return (
                    user && <span key={`avatar-${user.id}`} className="w-10 h-10 border-2 border-white rounded-full border-gray-800 align-center text-center content-center bg-card">{user.name.charAt(0)}</span>
                  );
                })
              }
            </div>
          )}
        </CardContent>
      </Card>
      {isModalOpen && <Modal task={{ ...task, id: String(task.id), columnId: String(task.columnId) }} onClose={toggleModal} />}
    </>
  );
}