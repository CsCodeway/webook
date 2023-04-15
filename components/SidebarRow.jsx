import Image from "next/image";

const SidebarRow = ({ src, Icon, title }) => {
  return (
    <>
      <div className="hidden sm:flex items-center space-x-2 p-4 dark:hover:bg-blue-700 hover:bg-gray-200 rounded-xl cursor-pointer">
        {src && (
          <Image
            className="rounded-full"
            src={src}
            width={40}
            height={40}
            layout="fixed"
            alt="/"
          />
        )}
        {Icon && <Icon className="h-8 w-8 text-blue-500" />}
        <p className="flex font-medium">{title}</p>
      </div>
    </>
  );
};
export default SidebarRow;
