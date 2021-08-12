import {useState,useRef,useEffect} from 'react';
import axios from 'axios';


// const instance = axios.create({
//   baseURL: 'http:localhost:8080',
//    withCredentials: true
// });
//  axios.defaults.baseURL = 'http://localhost:8080';
axios.defaults.withCredentials= true;



const OrderBotChat=()=>{
const [text,setText] = useState('');
const [chats,setChats] = useState([]);
const autoScroll= useRef(null);
const [responseLoading, setResponseLoading]= useState(false);



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
 
    const chat = [...chats,{data:text, type:'send'}]; 
    setChats(chat)
    setResponseLoading(true);
   
 const res = await  axios.get('http://localhost:8080/order-bot',{params:{ques: text}})
    console.log(chats);
    setResponseLoading(false);
    setChats([...chat,{data:res.data, type:'receive'}])
  
 
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

export default OrderBotChat;

