import { useEffect, useRef } from "react";
import { useQuill } from "react-quilljs";

import "quill/dist/quill.snow.css"; // Add css for snow theme

import { Task } from "../TaskCard";

// Fonction pour décoder les entités HTML
export function decodeHtml(html: string) {
  var txt = document.createElement("textarea");
  txt.innerHTML = html;
  return txt.value;
}

export function convertToPlain(html: string) {

  // Create a new div element
  var tempDivElement = document.createElement("div");

  // Set the HTML content with the given value
  tempDivElement.innerHTML = html;

  // Retrieve the text property of the element 
  return tempDivElement.textContent || tempDivElement.innerText || "";
}

function encodeHtml(html: string) {
  var txt = document.createElement("textarea");
  txt.value = html;
  return txt.innerHTML;
}

interface ReactQuilljsProps {
  task: Task;
  handleUpdateTask: (html: string, task: Task) => void;
}

export function ReactQuilljs({task, handleUpdateTask}: ReactQuilljsProps) {
  const { quill, quillRef } = useQuill();
  const previousHtml = useRef(task.description); // Utiliser useRef pour garder la trace de l'ancien HTML

  useEffect(() => {
    if (quill) {
      quill.on('text-change', () => {
        const currentHtml = quill.root.innerHTML;
        if (currentHtml !== previousHtml.current) {
          handleUpdateTask(currentHtml, task);
          previousHtml.current = currentHtml; // Mettre à jour la référence après le changement
        }
      });
    }
  }, [quill, handleUpdateTask, task]);

  useEffect(() => {
    if (quill) {
      const decodedDescription = decodeHtml(task.description); // Décoder le HTML
      if (previousHtml.current !== decodedDescription) {
        quill.clipboard.dangerouslyPasteHTML(decodedDescription);
        previousHtml.current = decodedDescription; // Mettre à jour la référence
      }
    }
  }, [quill, task.description]);

  return (
    <div className="grid">
      <div ref={quillRef} id={`description${task.id}`} />
    </div>
  );
};