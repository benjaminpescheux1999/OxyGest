// import {  Sun, FlipVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Task } from "../TaskCard"
import { useTaskContext } from "../TaskContext";

const EllipsisVerticalIcon = ( ) => (
    // <FlipVertical className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100">
        <circle cx="12" cy="12" r="1"/>
        <circle cx="12" cy="5" r="1"/>
        <circle cx="12" cy="19" r="1"/>
    </svg>
);
interface MenuDialProps {
  task: Task;
  view: () => void;
}



export function MenuDial({ task, view }: MenuDialProps) {
    const { handleDeleteTask } = useTaskContext();
  
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="relative border-none focus-visible:ring-0 focus-visible:ring-offset-0 justify-self-end	">
            {/* <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" /> */}
            <EllipsisVerticalIcon />
            <span className="sr-only">Toggle tools</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); view()}}>
            Voir
          </DropdownMenuItem>
          <DropdownMenuItem onClick={(e) => {e.stopPropagation(); handleDeleteTask(task.id)}}>
            Supprimer
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }