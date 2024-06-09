const socket = new WebSocket(`wss://${location.host}/`);

var term = new Terminal({
  cursorBlink: true,
  cols: 206,
  rows: 54,
});
var fitAddon = new FitAddon.FitAddon();
term.loadAddon(fitAddon);
term.open(document.getElementById("terminal"));
fitAddon.fit();

term.onResize(function (evt) {
  const terminal_size = {
    Width: evt.cols,
    Height: evt.rows,
  };

  socket.send("\x04" + JSON.stringify(terminal_size));
});

term.attachCustomKeyEventHandler((e) => {
  if (e.type === "keyup") {
    if (e.key === "v" && e.ctrlKey) {
      debounce(function () {
        navigator.clipboard.readText().then((text) => {
          socket.send(text);
        });
      }, 200);

      return false;
    }
  }
});

const xterm_resize_ob = new ResizeObserver(function (entries) {
  try {
    fitAddon && fitAddon.fit();
  } catch (err) {
    console.log(err);
  }
});

xterm_resize_ob.observe(document.querySelector("#terminal"));

function debounce(func, delay) {
  let timeout = null;
  return () => {
    if (timeout) clearTimeout(timeout);

    timeout = setTimeout(() => {
      func();
    }, delay);
  };
}

function init() {
  if (term._initialized) {
    return;
  }

  term._initialized = true;

  // term.prompt = () => {
  //   term.write("\r\n$ ");
  // };

  term.onKey((key) => {
    runCommand(term, key.key);
  });
}

function runCommand(term, command) {
  socket.send(command);
}

socket.onmessage = (event) => {
  term.write(event.data);
};

socket.onopen = (event) => {
  //socket.send("\r");
};

init();

function dragOverHandler(ev) {
  console.log("File(s) in drop zone");
  // Prevent default behavior (Prevent file from being opened)
  ev.preventDefault();
}

function dropHandler(ev) {
  console.log("File(s) dropped");

  // Prevent default behavior (Prevent file from being opened)
  ev.preventDefault();

  if (ev.dataTransfer.items) {
    // Use DataTransferItemList interface to access the file(s)
    let files = "";
    [...ev.dataTransfer.items].forEach((item, i) => {
      // If dropped items aren't files, reject them
      if (item.kind === "file") {
        const file = item.getAsFile();
        files += `${i + 1} - ${file.name}\r\n`;
      }
    });
    let count = ev.dataTransfer.items.length;
    if (confirm(`Continue uploading ${count} items?\r\n ${files}`) == true) {
      let formData = new FormData();
      [...ev.dataTransfer.items].forEach((item, i) => {
        // If dropped items aren't files, reject them
        if (item.kind === "file") {
          const file = item.getAsFile();
          formData.append("files", file);
        }
      });
      const xhr = new XMLHttpRequest();
      xhr.open("POST", "/upload", true);
      xhr.onreadystatechange = function () {
        if (xhr.readyState === XMLHttpRequest.DONE) {
          if (xhr.status === 200) {
            // Handle successful response from the server
            alert("Files uploaded successfully!");
          } else {
            // Handle error response from the server
            alert("Error occurred during file upload. Please try again.");
          }
        }
      };
      xhr.send(formData);
    } else {
      console.log("upload cancelled");
    }
  } else {
    // Use DataTransfer interface to access the file(s)
    [...ev.dataTransfer.files].forEach((file, i) => {
      console.log(`… file[${i}].name = ${file.name}`);
    });
  }
}
