import React, { createContext, useContext, useState, useMemo, useRef, ReactNode, useEffect } from 'react';
import { Task } from './TaskCard';
import { UniqueIdentifier } from '@dnd-kit/core';
import axios from 'axios';
import { useAuth } from '../context/authContext';
import LoginForm from './ui/forms/login';
import IUser from './types/user';
// Déplacez les types et interfaces ici
export interface Column {
  id: string;
  title: string;
}

export type ColumnType = "Column";
export type ColumnId = UniqueIdentifier;

export interface ColumnDragData {
  type: ColumnType;
  column: Column;
}

interface TaskContextType {
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  handleDeleteTask: (taskId: string) => void;
  handleChangeTask: (task: Task) => void;
  columns: Column[];
  setColumns: React.Dispatch<React.SetStateAction<Column[]>>;
  activeColumn: Column | null;
  setActiveColumn: React.Dispatch<React.SetStateAction<Column | null>>;
  activeTask: Task | null;
  setActiveTask: React.Dispatch<React.SetStateAction<Task | null>>;
  pickedUpTaskColumn: React.MutableRefObject<string | null>;
  columnsId: string[];
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

const initialTasks: Task[] = [
  {
    id: "inittaskintodo",
    columnId: "todo",
    description: "",
    name: "",
    visible: false,
    status: 2,
    applicants: [],  
    observers: [],
    attributedTo: [],
  },
  {
    id: "inittaskinprogress",
    columnId: "in-progress",
    description: "",
    name: "",
    visible: false,
    status: 3,
    applicants: [],
    observers: [],
    attributedTo: [],
  },
  {
    id: "inittaskindone",
    columnId: "done",
    description: "",
    name: "",
    visible: false,
    status: 6,
    applicants: [],
    observers: [],
    attributedTo: [],
    },
]

const defaultCols: Column[] = [
  {
    id: "todo",
    title: "A faire",
  },
  {
    id: "in-progress",
    title: "En cours",
  },
  {
    id: "done",
    title: "Fait",
  },
];

export const TaskProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [columns, setColumns] = useState<Column[]>(defaultCols);
  const [activeColumn, setActiveColumn] = useState<Column | null>(null);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const pickedUpTaskColumn = useRef<string | null>(null);
  const columnsId = useMemo(() => columns.map((col) => col.id), [columns]);
  const { userActive } = useAuth();
  const [isTokenLoaded, setIsTokenLoaded] = useState(false);

  useEffect(() => {
    if (userActive?.sessionToken) {
      setIsTokenLoaded(true);
      getTickets(); // Appeler getTickets seulement quand sessionToken est disponible
    }
  }, [userActive]);

  function getStatusColumnId(status: number): string {
    switch (status) {
      case 1: return "todo"; // Example status mapping
      case 2: return "todo";
      case 3: return "in-progress";
      case 4: return "in-progress";
      case 5: return "done";
      case 6: return "done";
      default: return "todo"; // Default case if status is unrecognized
    }
  }

  const getTickets = async () => {
    if (!userActive?.sessionToken) return; // Assurez-vous que sessionToken est disponible

    let configGetTask = {
      method: 'get',
      maxBodyLength: Infinity,
      url: `http://localhost:8080/glpi/apirest.php/Ticket/?session_token=${userActive.sessionToken}`,
      headers: {}
    };

    const response = await axios.request(configGetTask);
    const responseData = response.data;
    const tickets: Task[] = [...new Set(initialTasks.map(task => task.id))].map(id => initialTasks.find(task => task.id === id)!);

    const userCache: Record<number, IUser> = {};

    for (const ticket of responseData) {
      const applicants: IUser[] = [];
      const observers: IUser[] = [];
      const attributedTo: IUser[] = [];

      const ticketUsersResponse = await axios.get(`http://localhost:8080/glpi/apirest.php/Ticket/${ticket.id}/Ticket_User/?session_token=${userActive.sessionToken}`);

      if (ticketUsersResponse.data.length > 0) {
        for (const userticket of ticketUsersResponse.data) {
          let userToAdd: IUser;
          if (userCache[userticket.users_id]) {
            userToAdd = userCache[userticket.users_id];
          } else {
            const userDetailsResponse = await axios.get(`http://localhost:8080/glpi/apirest.php/User/${userticket.users_id}/?session_token=${userActive.sessionToken}`);
            const userDetails = userDetailsResponse.data;
            userToAdd = {
              id: userticket.users_id,
              name: userDetails.name,
              realname: userDetails.realname || "",
              firstname: userDetails.firstname || ""
            };
            userCache[userticket.users_id] = userToAdd; // Cache user details to avoid redundant requests
          }

          switch (userticket.type) {
            case 1: applicants.push(userToAdd); break;
            case 2: attributedTo.push(userToAdd); break;
            case 3: observers.push(userToAdd); break;
          }
        }
      }

      // Ajouter le ticket avec les utilisateurs à la liste des tickets
      tickets.push({
        id: ticket.id,
        columnId: getStatusColumnId(ticket.status),
        description: ticket.content,
        name: ticket.name,
        visible: true,
        status: ticket.status,
        applicants: applicants,
        observers: observers,
        attributedTo: attributedTo,
      });
    }
    setTasks(tickets);
  };
  
  const deleteTicketUserRelation = async (relationId: number) => {
    const config = {
      method: 'DELETE',
      maxBodyLength: Infinity,
      url: `http://localhost:8080/glpi/apirest.php/Ticket_User/${relationId}?session_token=${userActive?.sessionToken}`,
      headers: { 
        'Content-Type': 'application/json'
      }
    };
  
    await axios.request(config)
      .catch((error) => {
        console.log("Deleted relation:", error);
      });
  };
  
  const updateRelations = async (task: Task) => {
    if (!userActive?.sessionToken) return;
    
    const existingRelationsResponse = await axios.get(
      `http://localhost:8080/glpi/apirest.php/Ticket/${task.id}/Ticket_User/?session_token=${userActive.sessionToken}`
    );
    
    const existingRelations = existingRelationsResponse.data;
    
    const updatedRelations = {
      applicants: task.applicants?.map(user => user.id),
      attributedTo: task.attributedTo?.map(user => user.id),
      observers: task.observers?.map(user => user.id),
    };

    // Check for relations to delete
    for (const relation of existingRelations) {
      const userId = relation.users_id;
      const relationType = relation.type;
      const relationId = relation.id;
  
      if (
        (relationType === 1 && !updatedRelations.applicants?.includes(userId)) ||
        (relationType === 2 && !updatedRelations.attributedTo?.includes(userId)) ||
        (relationType === 3 && !updatedRelations.observers?.includes(userId))
      ) {
        await deleteTicketUserRelation(relationId);
      }
    }

    // Add or update relations only if they are not already present
    const existingApplicantIds = existingRelations.filter((r:any) => r.type === 1).map((r:any) => r.users_id);
    const existingAttributedToIds = existingRelations.filter((r:any) => r.type === 2).map((r:any) => r.users_id);
    const existingObserverIds = existingRelations.filter((r:any) => r.type === 3).map((r:any) => r.users_id);

    const newApplicants = task.applicants?.filter(user => !existingApplicantIds.includes(user.id));
    const newAttributedTo = task.attributedTo?.filter(user => !existingAttributedToIds.includes(user.id));
    const newObservers = task.observers?.filter(user => !existingObserverIds.includes(user.id));

    if (newApplicants && newApplicants.length > 0) {
      await updateTicketUserRelationList(newApplicants, 1, task.id);
    }
    if (newAttributedTo && newAttributedTo.length > 0) {
      await updateTicketUserRelationList(newAttributedTo, 2, task.id);
    }
    if (newObservers && newObservers.length > 0) {
      await updateTicketUserRelationList(newObservers, 3, task.id);
    }
  };
  
  const updateTicketUserRelationList = async (users: IUser[], relationType: number, ticketId: string) => {
    for (const user of users) {
      // console.log("updateTicketUserRelationList ==> user", user);
      
        await updateTicketUserRelation(ticketId, user.id, relationType)
        .catch((error) => {
          console.log("updateTicketUserRelationList ==> error", error);
        });

    }
  };

  const updateTicketUserRelation = async (ticketId: string, userId: number, relationType: number) => {
  
    let data = JSON.stringify({
      "input": {
        "tickets_id": Number(ticketId),  // ID du ticket
        "users_id": Number(userId),      // ID de l'utilisateur
        "type": Number(relationType),    // Type de relation (1: demandeur, 2: assigné, 3: observateur)
      }
    });
  
    let config = {
      method: 'POST',
      maxBodyLength: Infinity,
      url: `http://localhost:8080/glpi/apirest.php/Ticket_User/?session_token=${userActive?.sessionToken}`,  // URL de l'API avec le token de session
      headers: { 
        'Content-Type': 'application/json'  // Type de contenu
      },
      data : data  // Données envoyées dans la requête
    };
  
    const response = await axios.request(config)  // Envoi de la requête via Axios
      .catch((error) => {
        console.log("updateTicketUserRelation ==> error", error);  // Affichage de l'erreur en cas d'échec
      });
  
    return response;  // Retourne la réponse de la requête
  };
  
  const updateTask = async (task: Task) => {
    //récupérer l'id du status
    const statusId = task.columnId === "todo" ? 2 : task.columnId === "in-progress" ? 3 : 6;
    const response = await axios.put(
      `http://localhost:8080/glpi/apirest.php/Ticket/${task.id}/?session_token=${userActive?.sessionToken}`,
      {
        input: {
          name: task.name,
          status:statusId,
          date_mod: new Date().toISOString(),
          content: task.description,
          users_id_lastupdater: userActive?.user?.id
        }
      }
    );
    await updateRelations(task);
    getTickets();
  };

  useEffect(() => {
    getTickets();
  }, []);

  const handleDeleteTask = (taskId: string) => {
    setTasks((prevTasks) => prevTasks.filter(task => task.id !== taskId));
  };

  const handleChangeTask = (task: Task) => {
    updateTask(task);
  };

  if (!userActive?.sessionToken) {
    // Retourner le formulaire de connexion au lieu de "Chargement..."
    return <LoginForm />; // Assurez-vous que le composant LoginForm est importé et disponible
  }

  return (
    <TaskContext.Provider value={{ tasks, setTasks, handleDeleteTask, handleChangeTask, columns, setColumns, activeColumn, setActiveColumn, activeTask, setActiveTask, pickedUpTaskColumn, columnsId }}>
      {children}
    </TaskContext.Provider>
  );
};

export const useTaskContext = () => {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTaskContext must be used within a TaskProvider');
  }
  return context;
};