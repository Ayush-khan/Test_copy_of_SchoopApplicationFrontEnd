import React, { useState, useRef, useEffect } from "react";
import Cropper from "react-cropper";
import "cropperjs/dist/cropper.css";
import { MdOutlineEdit } from "react-icons/md";
import { FaUserCircle } from "react-icons/fa";

const ImageCropperRC = ({ onImageCropped, photoPreview }) => {
  console.log("photoPRevious of the imageCropper component", photoPreview);
  const [image, setImage] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [croppedImage, setCroppedImage] = useState(photoPreview || null);
  const [editingImage, setEditingImage] = useState(null);
  const [fileName, setFileName] = useState(""); // State to hold the file name

  console.log("the vlaue of the image inside imagecrop ", croppedImage);
  const cropperRef = useRef(null);
  const fileInputRef = useRef(null);
  useEffect(() => {
    setCroppedImage(photoPreview || null); // Update croppedImage if photoPreview is available
  }, [photoPreview]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        console.log("Image loaded successfully", reader.result); // Check if the image data is loaded
        setImage(reader.result);
        setEditingImage(reader.result);
        setFileName(file.name); // Set the file name

        setModalOpen(true);
        e.target.value = null;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    const cropper = cropperRef.current?.cropper;
    if (cropper) {
      const croppedCanvas = cropper.getCroppedCanvas({
        width: 1024, // Resize canvas width, you can adjust as needed
        height: 1024, // Resize canvas height, you can adjust as needed
        imageSmoothingEnabled: true,
        imageSmoothingQuality: "high",
      });
      // Convert the canvas to a Blob with compression
      //   const compressImage = (canvas, quality = 0.8) => {
      //     return new Promise((resolve) => {
      //       canvas.toBlob(
      //         (blob) => {
      //           if (blob.size <= 500 * 1024) {
      //             resolve(blob);
      //           } else {
      //             // If size exceeds 500KB, recursively try with lower quality
      //             resolve(compressImage(canvas, quality * 0.9));
      //           }
      //         },
      //         "image/jpeg",
      //         quality // Start with 80% quality
      //       );
      //     });
      //   };
      const compressImage = (canvas, quality = 0.8) => {
        return new Promise((resolve) => {
          canvas.toBlob(
            (blob) => {
              if (blob.size <= 200 * 1024) {
                // ✅ Stop once image is below 200KB
                resolve(blob);
              } else if (quality > 0.1) {
                // 🔄 Keep compressing with lower quality
                resolve(compressImage(canvas, quality * 0.9));
              } else {
                // ⚠️ Fallback: if it still doesn’t go below 200KB, return anyway
                resolve(blob);
              }
            },
            "image/jpeg",
            quality
          );
        });
      };

      compressImage(croppedCanvas)
        .then((compressedBlob) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            const compressedImageData = reader.result;
            setCroppedImage(compressedImageData);
            setEditingImage(null);
            setModalOpen(false);
            onImageCropped(compressedImageData);
          };
          reader.readAsDataURL(compressedBlob);
        })
        .catch((error) => {
          console.error("Error during image compression:", error);
        });
    } else {
      console.error("Cropper is not initialized or ref is not set.");
    }
  };

  const handleEditAgain = () => {
    setEditingImage(croppedImage);
    setModalOpen(true);
  };

  const handleCancel = () => {
    setEditingImage(null);
    setModalOpen(false);
  };

  return (
    // <div className="container mx-auto ">
    //   <label className="block font-bold  text-xs mb-2">
    //     {croppedImage ? (
    //       <>
    //         <img
    //           src={croppedImage}
    //           alt="Cropped"
    //           className="h-20 w-20 rounded-[50%] mx-auto border-1 border-black object-cover"
    //         />
    //         {/* Edit Icon */}
    //         <p className="relative bottom-5">
    //           <MdOutlineEdit
    //             className="m-auto text-3xl md:absolute md:left-[44%] hover:cursor-pointer text-white p-1 rounded-full bg-gray-800 hover:bg-gray-700 border border-gray-600"
    //             onClick={handleEditAgain}
    //           />
    //         </p>
    //       </>
    //     ) : (
    //       <FaUserCircle className="mt-2 h-20 w-20 object-cover mx-auto text-gray-300" />
    //     )}
    //   </label>
    //   <input
    //     type="file"
    //     id="photo"
    //     name="photo"
    //     accept="image/*"
    //     onChange={handleImageChange}
    //     ref={fileInputRef}
    //     className=" md:w-[50%] input-field flex-center text-xs box-border mt-2 bg-black text-white  "
    //   />
    //   {modalOpen && (
    //     <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex justify-center items-center z-50">
    //       <div className="bg-white p-4 rounded-lg shadow-lg max-w-lg w-full">
    //         <h2 className="text-xl mb-4">Edit Image</h2>
    //         <Cropper
    //           src={editingImage}
    //           style={{ height: 400, width: "100%" }}
    //           initialAspectRatio={1}
    //           aspectRatio={1}
    //           guides={false}
    //           ref={cropperRef}
    //           crossOrigin="anonymous" // Add this prop
    //           viewMode={1}
    //         />
    //         <div className="mt-4 flex justify-between">
    //           <button
    //             onClick={handleCancel}
    //             className="bg-red-500 font-md text-white px-4 py-2 rounded hover:bg-red-600"
    //           >
    //             Cancel
    //           </button>{" "}
    //           <button
    //             type="button"
    //             onClick={handleSave}
    //             className="bg-blue-500 font-md text-white px-4 py-2 rounded hover:bg-blue-600"
    //           >
    //             Save
    //           </button>
    //         </div>
    //       </div>
    //     </div>
    //   )}
    // </div>

    <div className="container mx-auto">
      <label className="block font-bold text-xs mb-2">
        <div className="flex items-center gap-4 justify-center">
          {croppedImage ? (
            <>
              <div className="relative">
                <img
                  src={croppedImage}
                  alt="Cropped"
                  className="h-20 w-20 rounded-full border border-black object-cover"
                />
                {/* Edit Icon */}
                <MdOutlineEdit
                  className="absolute bottom-0 right-0 text-2xl hover:cursor-pointer text-white p-1 rounded-full bg-gray-800 hover:bg-gray-700 border border-gray-600"
                  onClick={handleEditAgain}
                />
              </div>
            </>
          ) : (
            <FaUserCircle className="h-20 w-20 text-gray-300" />
          )}

          {/* File input on the same line */}
          <input
            type="file"
            id="photo"
            name="photo"
            accept="image/*"
            onChange={handleImageChange}
            ref={fileInputRef}
            className="md:w-[29.5%] text-xs bg-gray-300 text-white px-2 py-1 rounded cursor-pointer"
          />
        </div>
      </label>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex justify-center items-center z-50">
          <div className="bg-white p-4 rounded-lg shadow-lg max-w-lg w-full">
            <h2 className="text-xl mb-4">Edit Image</h2>
            <Cropper
              src={editingImage}
              style={{ height: 400, width: "100%" }}
              initialAspectRatio={1}
              aspectRatio={1}
              guides={false}
              ref={cropperRef}
              crossOrigin="anonymous"
              viewMode={1}
            />
            <div className="mt-4 flex justify-between">
              <button
                onClick={handleCancel}
                className="bg-red-500 font-md text-white px-4 py-2 rounded hover:bg-red-600"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="bg-blue-500 font-md text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageCropperRC;
