function SideBarMenuItem({ isHovered, icon, label, onClick }) {
  return (
    <div
      className="flex items-center gap-2 px-2 py-2 text-center hover:bg-gray-600 cursor-pointer"
      onClick={onClick}
    >
      {/* Icon remains visible at all times */}
      <div className="text-white text-xl cursor-pointer  rounded ">{icon}</div>

      {/* Only the text fades in/out */}
      <div
        className={`text-white text-center  transition-all duration-500 transform whitespace-nowrap ${
          isHovered ? "opacity-100  w-auto" : "opacity-0  w-0"
        }`}
      >
        {label}
      </div>
    </div>
  );
}

export default SideBarMenuItem;
