const express = require("express");
const csv = require("csv-parser");
const fs = require("fs");
const MongoClient = require('mongodb').MongoClient;
const url = "mongodb://localhost:27017/";
const multer = require('multer');
var upload = multer({ dest: 'uploads/' })
const findAnswer=require('./middleware_findAnswer');
const cors = require('cors');
const bodyParser = require('body-parser')
//var questions = [],
 // answers = [];
//var results = [];



var app = express();
app.use(cors({
   'credentials': true,
   'origin': 'http://localhost:3000'

}))
app.use(bodyParser.json());

const readFile = (filename,originalFileName)=>{
 const results = [],answers=[],questions=[];
  
fs.createReadStream("./uploads/"+filename)
  .pipe(csv(["Questions", "Answers"]))
  .on("data", (data) => results.push(data))
  .on("end", () => {
	 const faq=[];

    for (let i = 1; i < results.length; i++) {
     // questions.push(results[i]["Questions"]);
     // answers.push(results[i]["Answers"]);
	 faq.push({question:results[i]["Questions"], answer: results[i]["Answers"]})
	 
    }
	
	   MongoClient.connect(url, function(err, db) {
  if (err) throw err;
  var dbo = db.db("faqBot_documents");
 
  dbo.collection(filename).insertMany(faq, function(err, res) {
    if (err) throw err;
    console.log("1 document inserted");
     fs.unlinkSync(`./uploads/${filename}`)
    db.close();
  });
});

     });
}

//readFile();
app.post('/testing',(req,res)=>{
console.log(req.body,req.query)

res.send()	

})


app.post('/dialog',(req,res,next)=>{
  const initialDialog = req.body.initialDialog;
  const fileName = req.body.fileName;	
	console.log(req.body)
  MongoClient.connect(url, async function(err,db){
    if(err) next(err);
    var dbo = db.db('faqBot_dialogs');
	const result = await dbo.collection("Dialogs").find({_id: fileName}).toArray();
         console.log("result"+result)
	if(result.length==0)
    dbo.collection('Dialogs').insertOne({_id: fileName, initialDialog:initialDialog},function(err,response){
     if(err) next(err)

    res.send({"message":"dialog inserted"})	   
     db.close();	   
   })
   else
	dbo.collection('Dialogs').updateOne({_id: fileName}, { $set: {"initialDialog":initialDialog} },
    { upsert: true },function(err,response){
     if(err) next(err)

    res.send({"message":"dialog inserted"})	   
     db.close();	   
   })
	   
  })
})

const getDialog=async (fileName)=>{
console.log('dialog')
try{
 const db = await MongoClient.connect(url)
    var dbo = db.db("faqBot_dialogs");
  
  const result = await dbo.collection("Dialogs").find({_id: fileName}).toArray();
  db.close();
  console.log(result )
  return result.length>0? result[0].initialDialog : "Hello, how are you doing. I am a FAQ Bot."
  
  
}catch(err){
  throw err;
}

}


app.get("/question",async (req, res) => {
console.log("data:"+req.query.ques)
const question_asked = req.query.ques;
const fileName = req.query.fileName
var initialDialog=false	
if( question_asked =='hey' ||  question_asked =='hi' ||  question_asked =='hello')
 initialDialog = true	

const ans= !initialDialog?  await findAnswer(question_asked,MongoClient ,url,fileName): await getDialog(fileName)
res.json({"answer":ans}) 
});


app.post('/upload-faq-file', upload.single('faq-file'), (req, res) => {
  
    console.log(req.file);
    readFile(req.file.filename,req.file.originalname);
   
    res.json({message:"file uploaded successfully"});
});



app.get('/faq-file/all',(req,res,next)=>{
 
	MongoClient.connect(url, function(err, db) {
  if (err)  next(err);

  var dbo = db.db("faqBot_documents");
  
  dbo.listCollections().toArray(function(err, result) {
    if (err)  next(err);
    console.log(result);
    const response = result.map(res=> res.name);
    res.json({ faqFiles: response })
	    db.close();
  });
})

})

app.get('/faq-file',(req,res,next)=>{
	//res.json({
	//	file:{
		//"questions":questions,
		//"answers":answers
	//}})
  const fileName = req.query.fileName;

	MongoClient.connect(url, function(err, db) {
  if (err)  next(err);
  var dbo = db.db("faqBot_documents");
  
  dbo.collection(fileName).find({}).toArray(function(err, result) {
    if (err)  next(err);
    console.log(result);
    const response = result.length!=0? result: {"message": "No File Found!" }
	res.send(response )
    db.close();
  });
});
})



app.delete('/faq-file',(req,res,next)=>{
  const fileName = req.query.fileName;

  MongoClient.connect(url, function(err, db) {
  if (err)  next(err);
  var dbo = db.db("faqBot_documents");
  dbo.collection(fileName).drop(function(err, delOK) {
    if (err){ 
  if(err.codeName == "NamespaceNotFound"){
   var error = new Error("No File Found!");
 error.statusCode  = 200;
  next(error)
 }else
  next(err);
} 
   db.close();
    if (delOK){
	   res.send({"message":"file deleted"}) 
    }
    
  });
});
})




app.all('*', (req, res, next) => {
  const err = new Error(`Can't find ${req.originalUrl} on this server!`);
  err.statusCode = 404;
 
  
  next(err);
});

app.use((err, req, res, next) => {
  console.log("err"+err)
  err.statusCode = err.statusCode || 500;
  res_object = {};
  res_object.messgage = err.message;
  
   if(err.field)
   res_object.field = err.field    

  res.status(err.statusCode).json(res_object);
});



app.listen(8080, () => console.log("server running at localhost:8080"));
