require("@tensorflow/tfjs");
const use = require("@tensorflow-models/universal-sentence-encoder");

var questions,
  answers ;
var tensor_data;
var last_faq_file = ""

var question_asked="";

module.exports= async (ques_asked,MongoClient,url,fileName)=>{
question_asked = ques_asked;
//read_data();

 if(last_faq_file != fileName){
 last_faq_file = fileName
 const db= await MongoClient.connect(url);
 const dbo = db.db("faqBot_documents");
 const result = await  dbo.collection(`${fileName}`).find({}).toArray();
 questions = [], answers = []
console.log(result)
 result.forEach((res)=>{
  questions.push(res.question)
  answers.push(res.answer) 
 })
 console.log(questions,answers)
}

 return await load_Model();

  
}


const load_Model = async () => {
  const model = await use.load()
    // Embed an array of sentences.

  const embeddings=await  model.embed([...questions, question_asked]); 

   return await cosine_similarity_matrix(embeddings.arraySync())
};


const cosine_similarity_matrix=(matrix)=>{
    values = [];
  
  const matrix_length= matrix.length;
  console.log("length: "+matrix_length)
  for(let i=0;i<matrix_length-1;i++){
   values.push( similarity(matrix[i],matrix[matrix_length-1]))
  }

  console.log(values);
 var large_value= 0.65;
 var large_value_index = -1;
  for(let i=0;i<values.length;i++){
    
    if(values[i]>large_value){
     large_value = values[i]
     large_value_index = i;
    }
  }
  console.log("Question: "+question_asked );
  const answer = large_value_index === -1?"No Answer Found for Your Query": answers[large_value_index]
  console.log("Answer: "+ answer )
  return answer;


   
  }


 const  similarity=(a, b)=> {
    var magnitudeA = Math.sqrt(dot(a, a));
    var magnitudeB = Math.sqrt(dot(b, b));
    if (magnitudeA && magnitudeB){
      const x=dot(a, b);
    //  console.log(x)
      return x;
      
    }else{ console.log( false)
     return false;
    }
  };

 const  dot=(a, b)=>{
    var hasOwnProperty = Object.prototype.hasOwnProperty;
    var sum = 0;
    for (var key in a) {
      if (hasOwnProperty.call(a, key) && hasOwnProperty.call(b, key)) {
        sum += a[key] * b[key]
      }
    }
    return sum
  }
