const express = require("express");
var session = require('express-session')
 const MongoClient = require('mongodb').MongoClient;
 const url = "mongodb://34.201.165.62:27017/";
 
var app = express();
var cors = require('cors')

var dataStore = []

app.use(cors({
    origin: 'http://localhost:3000',
	'credentials': true
}))

const dialog_flow = [
  "Hello, Are you looking for smartphone?",  
  "Nice, we have following smarphone brands in our inventory:\n@Item",
  "These are phone:\n @Item \nEnter the name of the phone",
  "You have selected @Item.\nNow Enter your details.\nYour Name?",
  "Your phone number?",
  "Your address?",
  "Your Details:\n @Item \nPress Done to Confirm Your order",
  "Your order is confirmed.\nYour order ID is @Item" 
 ];
 


function makeid() {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < 8; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * 
 charactersLength));
   }
   return result;
}

const getOrderID=()=>{
	//from 1 to 100
	return Math.floor(Math.random() * 100) + 1;
}

const setDataStore=(id,new_data)=>{
	var flag=false;
	for(var i=0;i < dataStore.length;i++){
		if(dataStore[i].id == id){
			 flag = true;
			dataStore[i]={...dataStore[i],...new_data};
		}
	}
	if(!flag)
	dataStore.push({id: id,...new_data});
	
	
}

const getDataStore=(id)=>{
	var data=null;
	for(var i=0;i < dataStore.length;i++){
		if(dataStore[i].id == id){
			 
			data = dataStore[i];
			break;
		}
	}
	
	return data;
}

const saveToDb=(id)=>{
		var data=null;
	for(var i=0;i < dataStore.length;i++){
		if(dataStore[i].id == id){
			 
			data = dataStore[i];
			break;
		}
	}
	delete data.id; 
	delete data.dialog_stage;
	
	MongoClient.connect(url, function(err, db) {
  if (err) throw err;
  var dbo = db.db("order_bot");
  
  dbo.collection("orders").insertOne(data, function(err, res) {
    if (err) throw err;
    console.log("1 document inserted");
    db.close();
  });
});
	
	
}

const getInventoryDataFromDb= async (brandName)=>{
	var response ='';
	const db = await MongoClient.connect(url)
    var dbo = db.db("order_bot");
    var regex = new RegExp(["^", brandName, "$"].join(""), "i");

  const result = await dbo.collection("smartphone_inventory").find({brand: regex}).toArray();
  db.close();
  console.log(result)
 result[0].items.forEach(data=> response+=response+"name: "+data.model_name+"\nprice: "+data.price+"\nspec: "+data.spec+"\n")
  return response
}

const getBrandDataFromDb= async ()=>{
	 var inventory="";
	
	const db = await MongoClient.connect(url)
    var dbo = db.db("order_bot");
  
  const result = await dbo.collection("smartphone_inventory").find({}).toArray();
  db.close();
   result.forEach(({brand},index)=>{inventory+=`${index+1} ${brand}\n`})
 return inventory;
}


const getDialog= async ({query,session})=>{
	const sessionID = session.id;
	const user_data = getDataStore(sessionID);
	console.log(user_data,sessionID,query.ques)
	if(query.ques.toLowerCase() == 'hello' || query.ques.toLowerCase()== 'hi' || query.ques.toLowerCase()== 'hey'){
	   setDataStore(sessionID,{"dialog_stage":0});
	   return dialog_flow[0]
   }else if(user_data!=null&&user_data.dialog_stage==0 && query.ques.toLowerCase()=='yes' || query.ques.toLowerCase() == 'yeah'){
	    setDataStore(sessionID,{"dialog_stage":1});
		return dialog_flow[1].replace("@Item",await getBrandDataFromDb()) 
	}
	else if(user_data!=null&&user_data.dialog_stage==0 && query.ques.toLowerCase()=='no' || query.ques.toLowerCase() == 'nope'){
	   
		return "Ok, have a nice day." 
	}
	else if(user_data!=null&& user_data.dialog_stage==1 && typeof query.ques === 'string'){
	  setDataStore(sessionID,{brand: query.ques,"dialog_stage":2});
      return dialog_flow[2].replace("@Item", await getInventoryDataFromDb(query.ques)) ;
    }	
	else if(user_data!=null&&user_data.dialog_stage==2 && typeof query.ques === 'string'){
	  setDataStore(sessionID,{phone_model: query.ques,"dialog_stage":3});
	  
      return dialog_flow[3].replace("@Item",query.ques) ;
	  
    }	
	else if(user_data!=null&&user_data.dialog_stage==3 && typeof query.ques === 'string'){
	  setDataStore(sessionID,{name: query.ques,"dialog_stage":4});
	  
      return dialog_flow[4]
	  
    }else if(user_data!=null&&user_data.dialog_stage==4 && !isNaN(query.ques)){
	  setDataStore(sessionID,{phoneNo: query.ques,"dialog_stage":5});
      return dialog_flow[5]
	  
    }else if(user_data!=null&&user_data.dialog_stage==5 ){
	  setDataStore(sessionID,{address: query.ques,"dialog_stage":6});
	   const res = "phone model: "+user_data.phone_model+"\nname: "+user_data.name+"\n phone no: "+user_data.phoneNo+"\n address: "+query.ques
      return dialog_flow[6].replace('@Item',res)
	  
    }
	
	else if(user_data!=null && user_data.dialog_stage==6 && query.ques.toLowerCase() === 'done' ){
	  const order_id = getOrderID();
	  setDataStore(sessionID,{orderID: order_id,"dialog_stage":7});
	  saveToDb(sessionID);
      return dialog_flow[7].replace("@Item",order_id);	
	}
	else{
		console.log('else')
		return dialog_flow[ user_data.dialog_stage || 0 ]
}
}

app.use(session({
  resave: false,
   cookie: { secure: false },
  saveUninitialized: true,
  genid: ()=>makeid(),
  secret: 'keyboard cat'
}))

app.get('/order-bot',async (req,res)=>{
	//console.log(req.query.ques.includes('smartphone') && req.query.ques.includes('buy'))
	console.log("req: "+req.sessionID)
    const data=await getDialog(req)
	res.send(data);
	
})



app.listen(8080, () => console.log("server running at localhost:8080"));
