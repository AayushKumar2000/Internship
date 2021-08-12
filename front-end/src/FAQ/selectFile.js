import {useState,useEffect} from 'react';
import axios from 'axios';

// axios.defaults.baseURL = 'http://54.237.11.214:8080';
// axios.defaults.withCredentials = true;
const instance = axios.create({
    baseURL: 'http://3.231.205.50:8080',
    withCredentials: true
  });




const SelectFile = ({changeSelectedFile,selectedFile}) => {
    useEffect(()=>{
        instance.get('/faq-file/all').then((res)=>{
         
           console.log(res.data.faqFiles)
           setFiles(["no file selected",...res.data.faqFiles]);
        }).catch(e=>console.log(e))
    },[])

    const [files,setFiles] = useState([]);
    const [uploadFile,setUploadFile] = useState(null);
    const [fileUploadStatus,setfileUploadStatus] = useState(null)
    const [welcomeDialog,setwelcomeDialog] = useState("");
    const [welcomeDialogStatus,setwelcomeDialogStatus ] =useState(null)

    const selectHandler=(event)=>{
        console.log(event.target.value)
        changeSelectedFile()
       changeSelectedFile(event.target.value)
      }

  const onUploadButton=()=>{
    var formData = new FormData();
  
    formData.append("faq-file", uploadFile);
    instance.post('/upload-faq-file',formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        ,
    },
     
    }).then(res=>{
        console.log(res)
        if(res.data.message==='file uploaded successfully')
        setfileUploadStatus("successfull")
        else
        setfileUploadStatus("failed")
    })
  }

  const uploadFileHandler=(event)=>{
       event.preventDefault();
       setUploadFile(event.target.files[0])
  }

  const welcomeDialogHandler=(event)=>{
      event.preventDefault();
      setwelcomeDialog(event.target.value);
  }

  const welcomeDialogButton=()=>{
    if(selectedFile){
        instance.post('/dialog',{fileName: selectedFile, 
        initialDialog: welcomeDialog }).then(res=>{
            if(res.data.message==="dialog inserted")
            setwelcomeDialogStatus("successfull")
            else
            setwelcomeDialogStatus("failed")

      })
    }else
     alert('select a faq file')
  }
      

 return (
     <div className="select">
         <div className="selectFile-heading">Select a File for FAQ Demo</div>
         <div className="selectFile- selectors" >
              <select name="file" id="file" value={selectedFile} onChange={(event)=>selectHandler(event)}>
                  {
                      files.map((f)=><option key={f} value={f}>{f}</option>)
                  }
              </select>
         </div>
         <div className="uploadFile">
         <div className="uploadFile-heading">upload a File for FAQ Demo</div>
         <div className="uploadFile-status">{fileUploadStatus==null? "": fileUploadStatus==="successfull"?"File Uploaded Successfully":"File Uploaded failed"}</div>
            <input onChange={(event)=>uploadFileHandler(event)}type="file" id="myFile" name="filename"/>
             <button onClick={()=>onUploadButton()} type="button">upload</button>
            
         </div>

         <div className="welcome-Dialog">
             <div>First select a file Then set a welcome Intent for that file.</div>
             <div className="welcome-Dialog-status">{welcomeDialogStatus==null? "": welcomeDialogStatus==="successfull"?"Dialog set Successfully":"Dialog set failed"}</div>

             <input  value={welcomeDialog} onChange={(event)=>welcomeDialogHandler(event)} />
             <button onClick={()=>welcomeDialogButton()}>Set Intent</button>

         </div>
     </div>

     
 );
}

export default SelectFile;