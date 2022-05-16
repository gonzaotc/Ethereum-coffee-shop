import CloseIcon from "./CloseIcon";

const Modal = ({ className, children, handleCloseModal, withOverlay = true }) => {
  // recieves width and height an extra styles by props.

  const handleStopPropagation = e => {
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <div
      className={`z-30 absolute h-screen w-screen top-0 left-0 bottom-0 right-0 flex justify-center items-center ${
        withOverlay && "bg-black/25"
      } `}
      onClick={handleCloseModal}
    >
      <div
        className={`relative w-[340px] rounded-md bg-white p-5 flex flex-col overflow-hidden drop-shadow-[0_0_15px_rgba(1,1,1,0.5)] ${className} `}
        onClick={handleStopPropagation}
      >
        {children}
        {/* <button className="absolute top-[0.6rem] right-[0.6rem]" onClick={handleCloseModal}>
          <CloseIcon />
        </button> */}
      </div>
    </div>
  );
};

export default Modal;
