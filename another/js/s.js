// Function to download data to a file
function download(data, filename, type) {
    var file = new Blob([data], {type: type});
    if (window.navigator.msSaveOrOpenBlob) // IE10+
        window.navigator.msSaveOrOpenBlob(file, filename);
    else { // Others
        var a = document.createElement("a"),
                url = URL.createObjectURL(file);
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        setTimeout(function() {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);  
        }, 0); 
    }
}


// (A) CREATE BLOB OBJECT
var myBlob = new Blob(["CONTENT"], {type: "text/plain"});

// (B) CREATE DOWNLOAD LINK
var url = window.URL.createObjectURL(myBlob);
var anchor = document.createElement("a");
anchor.href = url;
anchor.download = "demo.txt";
 
// (C) "FORCE DOWNLOAD"
// NOTE: MAY NOT ALWAYS WORK DUE TO BROWSER SECURITY
// BETTER TO LET USERS CLICK ON THEIR OWN
anchor.click();
window.URL.revokeObjectURL(url);
document.removeChild(anchor);


<script>
async function saveFile() {
  // (A) CREATE BLOB OBJECT
  var myBlob = new Blob(["CONTENT"], {type: "text/plain"});
 
  // (B) FILE HANDLER & FILE STREAM
  const fileHandle = await window.showSaveFilePicker({
    types: [{
      description: "Text file",
      accept: {"text/plain": [".txt"]}
    }]
  });
  const fileStream = await fileHandle.createWritable();
 
  // (C) WRITE FILE
  await fileStream.write(myBlob);
  await fileStream.close();
}
</script>
<input type="button" value="Save File" onclick="saveFile()">



  function download(filename, text) {
  var element = document.createElement('a');
  element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
  element.setAttribute('download', filename);

  element.style.display = 'none';
  document.body.appendChild(element);

  element.click();

  document.body.removeChild(element);
}

// Start file download.
download("hello.txt","This is the content of my file :)");






function download(filename, text) {
  var element = document.createElement('a');
  element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
  element.setAttribute('download', filename);

  element.style.display = 'none';
  document.body.appendChild(element);

  element.click();

  document.body.removeChild(element);
}

// Start file download.
download("hello.txt","This is the content of my file :)");


saveFile("/files/myFile.txt", "myFile.txt");


const file = new Blob(["Hello, file!"], { type: "text/plain" });
const url = window.URL.createObjectURL(file);
saveFile(url, "myFile.txt");
window.URL.revokeObjectURL(url);







async function downloadFile(url, filename) {
  try {
    const response = await fetch(url, {
      headers: {
        Accept:
          "application/json, text/plain,application/zip, image/png, image/jpeg, image/*",
      },
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);
    saveFile(blobUrl, filename);
    URL.revokeObjectURL(blobUrl);
  } catch (err) {
    console.error("Error in fetching and downloading file:", err);
  }
}


downloadFile("https://httpbin.org/robots.txt", "textFile.txt");
downloadFile("https://httpbin.org/image", "imageFile.jpg");
downloadFile("https://httpbin.org/json", "jsonFile.json");




const link = document.querySelector('a.simple');

const saveBtn = document.querySelector('button.save-file');

let name = 'Monty';

let text = `My name in ${name}.

I love writing tutorials.`;

var textBlob = new Blob([text], {type: 'text/plain'});

link.setAttribute('href', URL.createObjectURL(textBlob));

link.setAttribute('download', `${name.toLowerCase()}.txt`);


saveBtn.addEventListener('click', function(){
  
  var tempLink = document.createElement("a");
  
  let textArea = document.querySelector("textarea");
 
  var taBlob = new Blob([textArea.value], {type: 'text/plain'});

  tempLink.setAttribute('href', URL.createObjectURL(taBlob));

  tempLink.setAttribute('download', `${name.toLowerCase()}.txt`);
  
  tempLink.click();
  
  URL.revokeObjectURL(tempLink.href);
  
});

<a class="simple">Download Multi-line Text File (Blob)</a>

<textarea></textarea>

<button class="save-file">Save File</button>









const saveBtn = document.querySelector('button.save-file');
let name = 'Monty';
saveBtn.addEventListener('click', async function(){
  
  let textArea = document.querySelector("textarea");
  var taBlob = new Blob([textArea.value], {type: 'text/plain'});
  
  const pickerOptions = {
    suggestedName: `${name.toLowerCase()}.txt`,
    types: [
      {
        description: 'Simple Text File',
        accept: {
          'text/plain': ['.txt'],
        },
      },
    ],
  };
  const fileHandle = await window.showSaveFilePicker(pickerOptions);
  const writableFileStream = await fileHandle.createWritable();
  await writableFileStream.write(taBlob);
  await writableFileStream.close();
});











        const textarea = document.querySelector('textarea');
const textInput = document.querySelector('input.text');
const textButton = document.querySelector('button.text');

const img = document.querySelector('img');
const imgInput = document.querySelector('input.img');
const imgButton = document.querySelector('button.img');

const saveFile = async (blob, suggestedName) => {
  // Feature detection. The API needs to be supported
  // and the app not run in an iframe.
  const supportsFileSystemAccess =
    'showSaveFilePicker' in window &&
    (() => {
      try {
        return window.self === window.top;
      } catch {
        return false;
      }
    })();
  // If the File System Access API is supported…
  if (supportsFileSystemAccess) {
    try {
      // Show the file save dialog.
      const handle = await showSaveFilePicker({
        suggestedName,
      });
      // Write the blob to the file.
      const writable = await handle.createWritable();
      await writable.write(blob);
      await writable.close();
      return;
    } catch (err) {
      // Fail silently if the user has simply canceled the dialog.
      if (err.name !== 'AbortError') {
        console.error(err.name, err.message);
        return;
      }
    }
  }
  // Fallback if the File System Access API is not supported…
  // Create the blob URL.
  const blobURL = URL.createObjectURL(blob);
  // Create the `` element and append it invisibly.
  const a = document.createElement('a');
  a.href = blobURL;
  a.download = suggestedName;
  a.style.display = 'none';
  document.body.append(a);
  // Click the element.
  a.click();
  // Revoke the blob URL and remove the element.
  setTimeout(() => {
    URL.revokeObjectURL(blobURL);
    a.remove();
  }, 1000);
};

textButton.addEventListener('click', async () => {
  const blob = new Blob([textarea.value], { type: 'text/plain' });
  await saveFile(blob, textInput.value);
});

imgButton.addEventListener('click', async () => {
  const blob = await fetch(img.src).then((response) => response.blob());
  await saveFile(blob, imgInput.value);
});
        
