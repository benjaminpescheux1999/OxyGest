import { Fragment, useEffect, useState } from "react";
import { Combobox, Transition, ComboboxButton, ComboboxInput, ComboboxOptions, ComboboxOption } from "@headlessui/react";
import { CheckIcon, ChevronUpDownIcon } from "@heroicons/react/20/solid";
import IUser from "../types/user";
import { useTaskContext } from "../TaskContext";

export default function MultiSelectFilter() {
    const { users, selectedFilterUsers, setSelectedFilterUsers } = useTaskContext();
    const [selectedUserTemp, setSelectedUserTemp] = useState<IUser[]>(); // État temporaire pour la sélection
    const [query, setQuery] = useState("");

    useEffect(() => {
        setSelectedUserTemp(selectedFilterUsers);
    }, [selectedFilterUsers]);

    const filteredUsers = query === "" ? users : users.filter((user) =>
        user.name.toLowerCase().replace(/\s+/g, "").includes(query.toLowerCase().replace(/\s+/g, ""))
    );

    const handleConfirmSelection = () => {
        selectedUserTemp && setSelectedFilterUsers(selectedUserTemp); // Mettre à jour la sélection finale
    };

    return (
        <div className="m-auto flex justify-between gap-4">
            <ComboboxGroup label="Utilisateurs" selected={selectedUserTemp || []} setSelected={setSelectedUserTemp} users={filteredUsers} setQuery={setQuery} />
            <button onClick={handleConfirmSelection} className="relative mt-1 bg-input  hover:bg-gray-300 dark:hover:bg-gray-600 text-foreground dark:text-gray-200 font-bold py-2 px-4 rounded">
                Confirmer la sélection
            </button>
        </div>
    );
}

function ComboboxGroup({ label, selected, setSelected, users, setQuery }: { label: string, selected: IUser[], setSelected: (users: IUser[]) => void, users: IUser[], setQuery: (query: string) => void }) {
  return (
    <div>
      <Combobox value={selected} onChange={setSelected} multiple>
        <div className="relative mt-1">
          <div className="relative w-full cursor-default overflow-hidden rounded-lg text-left shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-teal-300 sm:text-sm bg-input dark:primary-foreground text-foreground dark:text-white">
            <ComboboxInput
              className="w-full border-none outline-none bg-input dark:bg-input text-foreground dark:text-white rounded-xl focus:ring-0"
              displayValue={(users: IUser[]) => users.length > 3 ? `${users[0].name}, et ${users.length - 1} autres` : users.map((user: IUser) => user.name).join(", ")}
              onChange={(event) => setQuery(event.target.value)}
            />
            <ComboboxButton className="absolute inset-y-0 right-0 flex items-center pr-2">
              <ChevronUpDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
            </ComboboxButton>
          </div>
          <Transition
            as={Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
            afterLeave={() => setQuery("")}
          >
            <ComboboxOptions className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-input dark:primary-foreground text-foreground dark:text-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm z-50">
              {users.length === 0  ? (
                <div className="relative cursor-default select-none py-2 px-4 text-gray-700">
                  Nothing found.
                </div>
              ) : (
                users.map((user: IUser) => (
                  <ComboboxOption
                    key={user.id}
                    className={({ active }) =>
                      `relative cursor-default select-none py-2 pl-10 pr-4 dark:hover:bg-white dark:hover:text-black ${
                        active ? "bg-input dark:primary-foreground text-foreground dark:text-white" : ""
                      }`
                    }
                    
                    value={user}
                  >
                    {({ selected, active }) => (
                      <>
                        <span
                          className={`block truncate ${
                            selected ? "font-medium" : "font-normal"
                          }`}
                        >
                          {user.name}
                        </span>
                        {selected ? (
                          <span
                            className={`absolute inset-y-0 left-0 flex items-center pl-3 ${
                              active ? "text-white" : "text-teal-600"
                            }`}
                          >
                            <CheckIcon className="h-5 w-5" aria-hidden="true" />
                          </span>
                        ) : null}
                      </>
                    )}
                  </ComboboxOption>
                ))
              )}
            </ComboboxOptions>
          </Transition>
        </div>
      </Combobox>
    </div>
  );
}