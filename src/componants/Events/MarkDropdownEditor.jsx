// // second try work correct only for link also
// import React, { useRef } from "react";
// import ReactQuill from "react-quill";
// import "react-quill/dist/quill.snow.css";

// // Custom handler for image upload
// function imageHandler() {
//   const input = document.createElement("input");
//   input.setAttribute("type", "file");
//   input.setAttribute("accept", "image/*");
//   input.click();

//   input.onchange = async () => {
//     const file = input.files[0];
//     const formData = new FormData();
//     formData.append("image", file);

//     const res = await fetch(
//       "https://api.imgbb.com/1/upload?key=8984397975a3738e6ebd1ecbece42617",
//       {
//         method: "POST",
//         body: formData,
//       }
//     );
//     const data = await res.json();
//     const range = this.quill.getSelection();
//     this.quill.insertEmbed(range.index, "image", data.data.url);
//   };
// }

// function linkHandler() {
//   const url = prompt("Enter the URL:");

//   if (url) {
//     const range = this.quill.getSelection();
//     if (range) {
//       // insert link text if nothing is selected
//       if (range.length === 0) {
//         this.quill.insertText(range.index, url, "link", url);
//       } else {
//         // apply link format on selected text
//         this.quill.format("link", url);
//       }
//     }
//   }
// }

// const MarkDropdownEditor = ({ value, onChange, readOnly = false }) => {
//   const quillRef = useRef(null);

//   const modules = readOnly
//     ? { toolbar: false } // hide toolbar in read-only mode
//     : {
//         toolbar: {
//           container: [
//             [{ font: [] }, { size: [] }],
//             ["bold", "italic", "underline", "strike"],
//             [{ color: [] }, { background: [] }],
//             [{ list: "ordered" }, { list: "bullet" }],
//             [{ align: [] }],
//             ["link", "image", "video"],
//             ["code-block"],
//             ["clean"],
//             ["fullscreen"],
//           ],
//           handlers: {
//             image: imageHandler,
//             link: linkHandler,
//           },
//         },
//       };

//   const formats = [
//     "font",
//     "size",
//     "bold",
//     "italic",
//     "underline",
//     "strike",
//     "color",
//     "background",
//     "list",
//     "bullet",
//     "align",
//     "link",
//     "image",
//     "video",
//     "code-block",
//   ];

//   return (
//     <div>
//       <ReactQuill
//         ref={quillRef}
//         theme="snow"
//         value={value}
//         onChange={onChange}
//         readOnly={readOnly}
//         modules={modules}
//         formats={formats}
//         style={{
//           height: readOnly ? "auto" : "100px",
//           marginBottom: readOnly ? "0" : "50px",
//           backgroundColor: readOnly ? "#f3f4f6" : "white", // light gray background for view mode
//         }}
//       />
//     </div>
//   );
// };

// export default MarkDropdownEditor;
<<<<<<< HEAD
import React, { useRef, useMemo } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

const MarkDropdownEditor = ({ value, onChange, readOnly = false }) => {
  const quillRef = useRef(null);

  // 🖼️ Custom image upload handler (ReactQuill v2 compatible)
  const imageHandler = async () => {
=======

// second try work correct only version 18
// import React, { useRef } from "react";
// import ReactQuill from "react-quill";
// import "react-quill/dist/quill.snow.css";

// Custom handler for image upload
// function imageHandler() {
//   const input = document.createElement("input");
//   input.setAttribute("type", "file");
//   input.setAttribute("accept", "image/*");
//   input.click();

//   input.onchange = async () => {
//     const file = input.files[0];
//     const formData = new FormData();
//     formData.append("image", file);

//     const res = await fetch(
//       "https://api.imgbb.com/1/upload?key=8984397975a3738e6ebd1ecbece42617",
//       {
//         method: "POST",
//         body: formData,
//       }
//     );
//     const data = await res.json();
//     const range = this.quill.getSelection();
//     this.quill.insertEmbed(range.index, "image", data.data.url);
//   };
// }

// function linkHandler() {
//   const url = prompt("Enter the URL:");

//   if (url) {
//     const range = this.quill.getSelection();
//     if (range) {
//       // insert link text if nothing is selected
//       if (range.length === 0) {
//         this.quill.insertText(range.index, url, "link", url);
//       } else {
//         // apply link format on selected text
//         this.quill.format("link", url);
//       }
//     }
//   }
// }

// const MarkDropdownEditor = ({ value, onChange, readOnly = false }) => {
//   const quillRef = useRef(null);

//   const modules = readOnly
//     ? { toolbar: false } // hide toolbar in read-only mode
//     : {
//         toolbar: {
//           container: [
//             [{ font: [] }, { size: [] }],
//             ["bold", "italic", "underline", "strike"],
//             [{ color: [] }, { background: [] }],
//             [{ list: "ordered" }, { list: "bullet" }],
//             [{ align: [] }],
//             ["link", "image", "video"],
//             ["code-block"],
//             ["clean"],
//             ["fullscreen"],
//           ],
//           handlers: {
//             image: imageHandler,
//             link: linkHandler,
//           },
//         },
//       };

//   const formats = [
//     "font",
//     "size",
//     "bold",
//     "italic",
//     "underline",
//     "strike",
//     "color",
//     "background",
//     "list",
//     "bullet",
//     "align",
//     "link",
//     "image",
//     "video",
//     "code-block",
//   ];

//   return (
//     <div>
//       <ReactQuill
//         ref={quillRef}
//         theme="snow"
//         value={value}
//         onChange={onChange}
//         readOnly={readOnly}
//         modules={modules}
//         formats={formats}
//         style={{
//           height: readOnly ? "auto" : "100px",
//           marginBottom: readOnly ? "0" : "50px",
//           backgroundColor: readOnly ? "#f3f4f6" : "white", // light gray background for view mode
//         }}
//       />
//     </div>
//   );
// };

// export default MarkDropdownEditor;

// Try for version 16
import React, { Component } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

class MarkDropdownEditor extends Component {
  constructor(props) {
    super(props);
    this.quillRef = null;
    this.reactQuillRef = null;

    this.modules = props.readOnly
      ? { toolbar: false }
      : {
          toolbar: {
            container: [
              [{ font: [] }, { size: [] }],
              ["bold", "italic", "underline", "strike"],
              [{ color: [] }, { background: [] }],
              [{ list: "ordered" }, { list: "bullet" }],
              [{ align: [] }],
              ["link", "image", "video"],
              ["code-block"],
              ["clean"],
            ],
            handlers: {
              image: this.imageHandler.bind(this),
              link: this.linkHandler.bind(this),
            },
          },
        };

    this.formats = [
      "font",
      "size",
      "bold",
      "italic",
      "underline",
      "strike",
      "color",
      "background",
      "list",
      "bullet",
      "align",
      "link",
      "image",
      "video",
      "code-block",
    ];
  }

  imageHandler() {
>>>>>>> develop
    const input = document.createElement("input");
    input.setAttribute("type", "file");
    input.setAttribute("accept", "image/*");
    input.click();

    input.onchange = async () => {
      const file = input.files[0];
<<<<<<< HEAD
      if (!file) return;

      const formData = new FormData();
      formData.append("image", file);

      try {
        const res = await fetch(
          "https://api.imgbb.com/1/upload?key=8984397975a3738e6ebd1ecbece42617",
          {
            method: "POST",
            body: formData,
          }
        );
        const data = await res.json();

        const quill = quillRef.current?.getEditor();
        const range = quill.getSelection(true);
        quill.insertEmbed(range.index, "image", data.data.url);
      } catch (err) {
        console.error("Image upload failed:", err);
      }
    };
  };

  // 🔗 Custom link handler
  const linkHandler = () => {
    const quill = quillRef.current?.getEditor();
    const range = quill.getSelection(true);
    const url = prompt("Enter the URL:");

    if (url) {
      if (range && range.length === 0) {
        quill.insertText(range.index, url, "link", url);
      } else {
        quill.format("link", url);
      }
    }
  };

  // 🧩 Quill toolbar config
  const modules = useMemo(() => {
    if (readOnly) return { toolbar: false };

    return {
      toolbar: {
        container: [
          [{ font: [] }, { size: [] }],
          ["bold", "italic", "underline", "strike"],
          [{ color: [] }, { background: [] }],
          [{ list: "ordered" }, { list: "bullet" }],
          [{ align: [] }],
          ["link", "image", "video"],
          ["code-block"],
          ["clean"],
        ],
        handlers: {
          image: imageHandler,
          link: linkHandler,
        },
      },
    };
  }, [readOnly]);

  const formats = [
    "font",
    "size",
    "bold",
    "italic",
    "underline",
    "strike",
    "color",
    "background",
    "list",
    "bullet",
    "align",
    "link",
    "image",
    "video",
    "code-block",
  ];

  return (
    <div>
      <ReactQuill
        ref={quillRef}
        theme="snow"
        value={value}
        onChange={onChange}
        readOnly={readOnly}
        modules={modules}
        formats={formats}
        style={{
          height: readOnly ? "auto" : "120px",
          marginBottom: readOnly ? "0" : "50px",
          backgroundColor: readOnly ? "#f3f4f6" : "white",
        }}
      />
    </div>
  );
};
=======
      const formData = new FormData();
      formData.append("image", file);

      const res = await fetch(
        "https://api.imgbb.com/1/upload?key=8984397975a3738e6ebd1ecbece42617",
        { method: "POST", body: formData }
      );
      const data = await res.json();
      const editor = this.reactQuillRef.getEditor();
      const range = editor.getSelection();
      editor.insertEmbed(range.index, "image", data.data.url);
    };
  }

  linkHandler() {
    const url = prompt("Enter the URL:");
    if (url) {
      const editor = this.reactQuillRef.getEditor();
      const range = editor.getSelection();
      if (range.length === 0) {
        editor.insertText(range.index, url, "link", url);
      } else {
        editor.format("link", url);
      }
    }
  }

  render() {
    const { value, onChange, readOnly } = this.props;
    return (
      <div>
        <ReactQuill
          ref={(el) => (this.reactQuillRef = el)}
          theme="snow"
          value={value}
          onChange={onChange}
          readOnly={readOnly}
          modules={this.modules}
          formats={this.formats}
          style={{
            height: readOnly ? "auto" : "100px",
            marginBottom: readOnly ? "0" : "50px",
            backgroundColor: readOnly ? "#f3f4f6" : "white",
          }}
        />
      </div>
    );
  }
}
>>>>>>> develop

export default MarkDropdownEditor;
