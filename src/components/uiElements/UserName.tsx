export default function UserName() {
  return (
    <div className="flex items-center gap-2">
      <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
        <img
          src="assets/user-logo.png"
          alt="Logo"
          className="w-full h-full object-contain "
        />
      </div>
      <div className="flex flex-col ">
        <div className="text-sm font-bold"> Hexacoder </div>
        <div className="text-xs font-medium">Admin</div>
      </div>
    </div>
  );
}
