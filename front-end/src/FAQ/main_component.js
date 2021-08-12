import Chat from './Chat';
import SelectFile  from './selectFile';
import {useState} from 'react';

function MainComponentFaq() {

    const [selectedFile,setSelectedFile] = useState(null);
  
    const changeSelectedFile = (file)=>{
      setSelectedFile(file);
    }
    return (
    <>
    
    <div className="main__component">
       <SelectFile changeSelectedFile={changeSelectedFile} selectedFile={selectedFile} />
       <Chat selectedFile={selectedFile} />
    </div>
    
    </>
    )
}

export default MainComponentFaq;