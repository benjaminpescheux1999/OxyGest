import React, { useEffect, useRef, useState } from "react";
import { Task } from "../TaskCard";
import {ReactQuilljs} from "./react-quilljs";
import  {useTaskContext} from "../TaskContext";
import MultipleSelectUser from "./multiselectUser";
import { IUser } from "../types/user";
interface ModalProps {
  task: Task;
  onClose: () => void;
}

const Modal: React.FC<ModalProps> = ({ task, onClose }) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const { tasks, setTasks, handleChangeTask } = useTaskContext();
  const [tempTask, setTempTask] = useState<Task>(task);

  const setApplicants = (applicants: IUser[]) => {
    setTempTask(prev => ({ ...prev, applicants }));
  };

  const setObservers = (observers: IUser[]) => {
    setTempTask(prev => ({ ...prev, observers }));
  };

  const setAttributedTo = (attributedTo: IUser[]) => {
    setTempTask(prev => ({ ...prev, attributedTo }));
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  const handleUpdateTask = (input: React.ChangeEvent<HTMLInputElement> | string) => {
    let newValue: string;
    let propertyKey: string;

    if (typeof input === 'string') {
      newValue = input;
      propertyKey = 'description';
    } else {
      newValue = input.target.value;
      propertyKey = input.target.id.replace(task.id, '');
    }

    setTempTask({ ...tempTask, [propertyKey]: newValue });
  };

  const handleSave = () => {
    const newTasks = tasks.map((t) => t.id === task.id ? tempTask : t);
    setTasks(newTasks);
    handleChangeTask(tempTask);
    onClose();
  };

  useEffect(() => {
    console.log(tempTask);
  }, [tempTask]);

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex justify-center items-center z-50">
      <div ref={modalRef} className="bg-background p-6 rounded-xl shadow-lg border border-white" style={{ pointerEvents: 'auto' }}>
        <div className="flex w-full gap-4">
            <div className="flex flex-col gap-3 w-2/3">
                <input type="text" id={`name`+task.id} className="w-full border-none outline-none bg-input dark:primary-foreground text-foreground dark:text-white rounded-xl" value={tempTask.name} onChange={(e) => handleUpdateTask(e)}/>
                <ReactQuilljs task={tempTask} handleUpdateTask={handleUpdateTask}/>
            </div>
            <div className="w-1/3">
                <MultipleSelectUser 
                  applicants={tempTask.applicants || []} 
                  observers={tempTask.observers || []} 
                  attributedTo={tempTask.attributedTo || []}
                  setApplicants={setApplicants}
                  setObservers={setObservers}
                  setAttributedTo={setAttributedTo}
                />
            </div>
        </div>
        <button 
          onClick={handleSave}  
          className="mt-4 bg-input dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-foreground dark:text-gray-200 font-bold py-2 px-4 rounded"
        >
          Save
        </button>
      </div>
    </div>
  );
};

export default Modal;