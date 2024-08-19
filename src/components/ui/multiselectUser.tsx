import { Fragment, useEffect, useState } from "react";
import axios from "axios";
import { Combobox, Transition, ComboboxButton, ComboboxInput, ComboboxOptions, ComboboxOption } from "@headlessui/react";
import { CheckIcon, ChevronUpDownIcon } from "@heroicons/react/20/solid";
import IUser from "../types/user";
import { Task } from "../TaskCard";
interface MultipleSelectUserProps {
  applicants: IUser[];
  observers: IUser[];
  attributedTo: IUser[];
  setApplicants: (users: IUser[]) => void;
  setObservers: (users: IUser[]) => void;
  setAttributedTo: (users: IUser[]) => void
}

export default function MultipleSelectUser({ applicants, observers, attributedTo, setApplicants, setObservers, setAttributedTo }: MultipleSelectUserProps) {
  const [users, setUsers] = useState<IUser[]>([]);
  const [selectedApplicants, setSelectedApplicants] = useState(applicants);
  const [selectedObservers, setSelectedObservers] = useState(observers);
  const [selectedAttributedTo, setSelectedAttributedTo] = useState(attributedTo);
  const [query, setQuery] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get('http://localhost:8080/glpi/apirest.php/User/?session_token=p2328bdi62rlhait6ctuamg3is');
        const fetchedUsers = response.data.map((user: any) => ({
          id: user.id,
          name: user.name,
          realname: user.realname || '',
          firstname: user.firstname || ''
        }));
        setUsers(fetchedUsers);
      } catch (error) {
        console.error('Failed to fetch users:', error);
      }
    };

    fetchUsers();
  }, []);

  useEffect(() => {
    // console.log("selectedApplicants", selectedApplicants);
    // console.log("selectedObservers", selectedObservers);
    // console.log("selectedAttributedTo", selectedAttributedTo);
    setApplicants(selectedApplicants);
    setObservers(selectedObservers);
    setAttributedTo(selectedAttributedTo);
  }, [selectedApplicants, selectedObservers, selectedAttributedTo]);

  const filteredUsers = query === "" ? users : users.filter((user) =>
    user.name.toLowerCase().replace(/\s+/g, "").includes(query.toLowerCase().replace(/\s+/g, ""))
  );

  return (
    <div className="flex flex-col gap-4">
      <ComboboxGroup label="Demandeurs" selected={selectedApplicants} setSelected={setSelectedApplicants} users={filteredUsers} setQuery={setQuery} />
      <ComboboxGroup label="Observateurs" selected={selectedObservers} setSelected={setSelectedObservers} users={filteredUsers} setQuery={setQuery} />
      <ComboboxGroup label="Attribués à" selected={selectedAttributedTo} setSelected={setSelectedAttributedTo} users={filteredUsers} setQuery={setQuery} />
    </div>
  );
}


function ComboboxGroup({ label, selected, setSelected, users, setQuery }: { label: string, selected: IUser[], setSelected: (users: IUser[]) => void, users: IUser[], setQuery: (query: string) => void }) {
  return (
    <div>
      <label>{label}</label>
      <Combobox value={selected} onChange={setSelected} multiple>
        <div className="relative mt-1">
          <div className="relative w-full cursor-default overflow-hidden rounded-lg text-left shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-teal-300 sm:text-sm bg-input dark:primary-foreground text-foreground dark:text-white">
            <ComboboxInput
              className="w-full border-none outline-none bg-input dark:primary-foreground text-foreground dark:text-white rounded-xl focus:ring-0"
              displayValue={(users: IUser[]) => users.map((user: IUser) => user.name).join(", ")}
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
                      `relative cursor-default select-none py-2 pl-10 pr-4 ${
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