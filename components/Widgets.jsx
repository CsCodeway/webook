import { SearchIcon } from "@heroicons/react/outline";
import { DotsHorizontalIcon, VideoCameraIcon } from "@heroicons/react/solid";
import Contact from "./Contact";

const contacts = [
  {
    src: "/../public/assets/dinesh.jpg",
    name: "Dinesh Suthar",
  }
];

const Widgets = () => {
  return (
    <div className="hidden lg:flex flex-col w-60 p-2 mt-5 cursor-pointer">
      <div className="flex justify-between items-center pr-2 text-gray-500 dark:text-white mb-5">
        <h2 className="text-xl cursor-default">Contacts</h2>
        <div className="flex space-x-2">
          <VideoCameraIcon className="h-6" />
          <SearchIcon className="h-6" />
          <DotsHorizontalIcon className="h-6" />
        </div>
      </div>

      {contacts.map((contact) => {
        return (
          <Contact key={contact.src} src={contact.src} name={contact.name} />
        );
      })}
    </div>
  );
};
export default Widgets;
