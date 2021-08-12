import {useState,useRef,useEffect} from 'react';
import axios from 'axios';


const instance = axios.create({
  baseURL: 'http://3.231.205.50:8080',
  withCredentials: true
});


const Chat=({selectedFile})=>{
const [text,setText] = useState('');
const [chats,setChats] = useState([]);
const autoScroll= useRef(null);
const [responseLoading, setResponseLoading]= useState(false);

console.log(selectedFile)

useEffect(() => {
  if (autoScroll) {
    autoScroll.current.addEventListener('DOMNodeInserted', event => {
      const { currentTarget: target } = event;
      target.scroll({ top: target.scrollHeight, behavior: 'smooth' });
    });
  }
}, [])

const onTextChange=(event)=>{
    event.preventDefault();
    setText(event.target.value)
}

const clickHandler=async()=>{
  if(selectedFile){
    const chat = [...chats,{data:text, type:'send'}]; 
    setChats(chat)
    setResponseLoading(true);
    console.log({ques: text ,  fileName: selectedFile,})
   const res = await  instance.get('/question',{params:{ques: text ,  fileName: selectedFile,}})
 // const res = await  axios.get('/question',{params:{ques: text}})
    console.log(chats);
    setResponseLoading(false);
  //  setChats([...chat,{data:res.data, type:'receive'}])
   setChats([...chat,{data:res.data.answer, type:'receive'}])
 }else{
   alert('select  a faq file')
 }
}

const sendTextToServer=async ()=> {
   

}




 return <div className="chat__component">
      <div className="chat-top">
        <div className="chat-top__heading">Chat Bot</div>
    </div>
     <div  ref={autoScroll} className="chat-content">{
        chats.map(chat => <div  key={chat.data} className={`chat-content-${chat.type}`} >
          <span style={{"whiteSpace": "pre-line"}}>{chat.data}</span>
        </div>
        )
     } 
     { responseLoading?<div className="dot-flashing-container"><div className="dot-flashing"></div></div>:<div></div> }
     </div>
    
    <div className="chat-typeArea">
        <div className="chat-typeArea__textbox">
            <input  className="chat-typeArea__textbox-input" value={text} onChange={(event)=>onTextChange(event)}/>
            <button onClick={()=>{clickHandler();sendTextToServer()}} type="button" className="chat-typeArea__textbox-button" >Send</button>
        </div>

        
   </div>
 </div>
}

export default Chat;

