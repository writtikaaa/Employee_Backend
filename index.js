import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import multer from "multer";
import path from "path";
import { error } from "console";


const app= express();
app.use(express.json());
app.use(express.urlencoded());
app.use(cors());

const d = new Date();
const t=d.getDate();
const h=d.getMonth();
//console.log("month",h);
const m= d.getFullYear();
const storage= multer.diskStorage({
    destination: (req,file, cb)=>{
        cb(null, 'public/images')
    },
    filename:(req, file,cb)=>{
        cb(null, file.fieldname+ "_"+ Date.now() + path.extname(file.originalname))
    }
});
const maxSize = 1 * 1000 * 1000; 
const upload= multer({
    storage: storage,

    limits: { fileSize: maxSize }, 
    fileFilter: function (req, file, cb){ 
    
        // Set the filetypes, it is optional 
        var filetypes = /jpeg|jpg|png/; 
        var mimetype = filetypes.test(file.mimetype); 
  
        var extname = filetypes.test(path.extname( 
                    file.originalname).toLowerCase()); 
        
        if (mimetype && extname) { 
            return cb(null, true); 
        } 
      
        cb("Error: File upload only supports the "
                + "following filetypes - " + filetypes); 
      }  
  
// mypic is the name of file attribute 
})
mongoose.set("strictQuery", false);
mongoose.connect("mongodb://127.0.0.1:27017/employeestack").then(()=>{
    console.log(`connection successful`);
}).catch((e)=>{
    console.log("connection is broken");
});

const employeeSchema= new mongoose.Schema({
        fname:String,
        lname: String,
        email:String,
        dob:String,
        passs:String,
        pswrepeat:String,
        gender:String,
        id:String,
        department:String,
        file:String
}
);


const Eregister= new mongoose.model("Eregister",employeeSchema);

const employeeleaveSchema= new mongoose.Schema({
    subject:String,
    date:String,
    date1:String,
    country:String,
    message:String,
    name:String,
    id:String,
    email:String,
    status:{ 
        type:String,
        enum: ['Approve', 'Cancel', null] 
    },
}
);

const Eleave= new mongoose.model("Eleave",employeeleaveSchema);
/* Login logout time schema */
const employeeLogTimeSchema= new mongoose.Schema({
    date:String,
    time:String,
    etime:String,
    pcode:String,
    pname:String,
    hours:String,
    work:String,
    id:String,
}
);
const ElogTime= new mongoose.model("ElogTime", employeeLogTimeSchema);
/*end Login logout time schema */
const adminTimeCalculate= new mongoose.Schema({
    totalSalary:String,
    id:String,
    totalwork:String,
    overtime:String,
    date:String,
    month:String,
}
);
const ESalary= new mongoose.model("ESalary", adminTimeCalculate);

const employeeWorkingSchema= new mongoose.Schema({
    id:String,
    email:String,
    hour:String,
    date:String,
    month:String,
}
);
const EWorkingTime= new mongoose.model("EWorkingTime", employeeWorkingSchema );

const adminProjectSchema= new mongoose.Schema({
    proname:String,
    procode:String,
    prodescription:String,
    empiddetails:[
        String
    ],
    
}
);
const AdProject= new mongoose.model("AdProject", adminProjectSchema );
const employeeProjectSchema= new mongoose.Schema({
   proname1:String,
   procode1:String,
   id1:String,
   current1:Boolean,
}
);
const ECurrentProject= new mongoose.model("ECurrentProject",employeeProjectSchema  );


app.post("/login",async (req,res)=>{
    //res.send("api login");
    var postingg=true;
    const {email, passs}=req.body;
    const data={
        email:email,
        passs:passs
    }
    //console.log(email);
    //console.log(passs);
    try{
        const check= await Eregister.findOne({email:email})
        if(check)
        {

            if(passs===check.passs)
            {
                
                res.send({message:"login succesful", check:check});
            }else{
                res.send({message:"password is incorrect"});
            }
        }else{
            res.send({message:"user not register"});
        }
    }catch(e)
    {
        console.log(e);
    }
   
})
app.post("/salary",upload.any(),async(req,res)=>{
    //console.log(req.body);
    const  Salary= new ESalary({
        totalSalary:req.body.totalSalary,
        id:req.body.id,
        totalwork:req.body.totalwork,
        overtime:req.body.overtime,
        date:t+"/"+h+1+"/"+m,
        month:req.body.month,
    })
    const sheet1=await Salary.save();
    res.send({message:"ok  Salary submitted"});
})
app.post("/projectadmin",upload.any(),async(req,res)=>{
    //console.log("hoooo",req.body.empiddetails.split(','));
    
    const  Projects= new AdProject({
        proname:req.body.proname,
        procode:req.body.procode,
        prodescription:req.body.prodescription,
        empiddetails:req.body.empiddetails.split(','),
    })
    //console.log(typeof req.body.empiddetails)
    const save4=await Projects.save();
    res.send({message:"ok  project submitted"});
})
app.post("/currentproject/:id",async(req,res)=>{
    //console.log("hoooo",req.body.empiddetails.split(','));
    console.log("klklk",req.params.id);
  const exit=await  ECurrentProject.findOne({id1: req.params.id}).select("id1").lean()
  if(exit)
    {
        try{
            await ECurrentProject.updateOne({id1: req.params.id}, {
                $set: {
                    proname1: req.body.proname,
                    procode1: req.body.procode,
                    
    
                }
            })
            return res.json({status: "ok", data: "update"})
        }catch(err){
            res.json({status: "no", data: "noupdate"})
        }
}else{
    const  P= new ECurrentProject({
        proname1:req.body.proname,
        procode1:req.body.procode,
        id1:req.body.id,
        current1:true,
    })
    //console.log(typeof req.body.empiddetails)
    const save5=await P.save();
    res.send({message:"ok  project seen"});
}
})
app.patch("/projectadmin/:procode",upload.any(),async(req,res)=>{
    //console.log("jkjk",req.body);
    try{
        await AdProject.updateOne({procode:req.params.procode},{
            $set: {
                proname: req.body.proname,
                procode: req.body.procode,
                prodescription: req.body.prodescription,
                empiddetails: req.body.empiddetails.split(','),

            }
        })
        return res.json({status: "ok", data: "update"})
    }catch(err){
        res.json({status: "no", data: "noupdate"})
    }
})
app.post("/timesheet", async(req,res)=>{
    //console.log(req.body);

        const TimeSheet= new ElogTime({
            date:req.body.date,
            time:req.body.time,
            etime:req.body.etime,
            pcode:req.body.pcode,
            pname:req.body.pname,
            hours:req.body.hours,
            work:req.body.work,
            id:req.body.id,
        })
        var postingg=false;
        const sheet=await TimeSheet.save();
        res.send({message:"ok your timesheet submitted"});
    
})
app.post("/working", async(req,res)=>{
    //console.log(req.body);
    const Workingtime= new EWorkingTime({
        id:req.body.id,
        email:req.body.email,
        hour:req.body.hour,
        date:t,
        month:h,
    })
    const sheet1=await Workingtime.save();

   //await Workingtime.aggregate([{$group: {id1:"$id", month1:"$month", sum_hour:{$sum:"$hour"}}}]).explain();
   
    res.send({message:"ok your Working submitted"});
})



app.post("/leave",async(req,res)=>{
    //console.log(req.body);
    const leave= new Eleave({
        subject: req.body.subject,
        date: req.body.date,
        date1: req.body.date1,
        country: req.body.country,
        message: req.body.message,
        name: req.body.name,
        id: req.body.id,
        email:req.body.email,
        status: null
    })
    const createleave= await leave.save();
    res.send({message:"ok leave applied succesfully"});
})
app.get("/leave/:id",(req,res)=>{
    Eleave.find({id: req.params.id}).limit(5)
    .then(user1=>res.json(user1))
    .catch(err=>res.json(err))
})
app.get("/currentproject/:id",(req,res)=>{
    console.log("kl",req.params.id)
    ECurrentProject.find({id1: req.params.id}).limit(5)
    .then(user1=>res.json(user1))
    .catch(err=>res.json(err))
})
app.get("/salary/:id",(req,res)=>{
    if(ESalary.find({
        procode1:null
        }))
        {
            res.message("insert your current project");
        }else{
            ESalary.find({id: req.params.id}).limit(5)
            .then(user8=>res.json(user8))
            .catch(err=>res.json(err))
        }
   
})
app.get("/salary/:id/:month",(req,res)=>{
    //console.log(req.params.month);
    //console.log(req.params.id);
    ESalary.find({month: req.params.month})
    .then(user9=>res.json(user9))
    .catch(err=>res.json(err))
})
// new Promise((resolve, reject)=>{
//     resolve(data)
// })
app.get("/working/:id",(req,res)=>{
    let sum=0;
    console.log("gargee",h);
    EWorkingTime.find({id: req.params.id})
    .then((user3)=>{
        console.log("length:=======",user3.length );
        for(let i=0; i<user3.length;i++)
        {
            if(parseInt(user3[i].month)===h)
            {
                console.log("jkjk", parseFloat(user3[i].hour));
                sum=sum + parseInt(user3[i].hour);
            }
        }
       
        console.log("j",sum);
        res.json(sum)
    })
    .catch((err)=>{
        res.json(err)
    })

})
/*delete*/
/*app.delete("/working/:id",async (req,res)=>{
    try{
        const _id= req.params.id;
        console.log(_id);
        const deletestudent= await Eregister.deleteOne({id:_id});
        if(!_id){
            res.status(400).send();
        }else{
            res.send(deletestudent);
        }
    }catch(e){
        res.status(500).send(e);
    }
})*/
/*jj*/
app.get("/timesheet/:id",(req,res)=>{
    ElogTime.find({id: req.params.id}).sort({_id:-1}).limit(5)
    .then(user2=>res.json(user2))
    .catch(err=>res.json(err))
})
app.get("/register/:id",(req,res)=>{
    Eregister.find({id: req.params.id})
    .then(user4=>res.json(user4))
    .catch(err=>res.json(err))
})
app.get("/projectadmin/:procode",(req,res)=>{
    //console.log(req.params.procode);
    AdProject.find({procode: req.params.procode})
    .then(user9=>res.json(user9))
    .catch(err=>res.json(err))
})
app.get("/register",(req,res)=>{
    Eregister.find().limit(5)
    .then(user11=>res.json(user11))
    .catch(err=>res.json(err))
})
app.get("/projectadmin/id/:id",(req,res)=>{
   ///console.log("bjbsj",req.params.id);
   AdProject.find({ empiddetails: {$all: [req.params.id] }},(err, data)=>{
    if(err) console.log(err);
    else{
        let arr= data.map(pre=>{
           return (pre._doc);
        })
        //console.log(JSON.stringify(arr))
        res.json(arr)
    }
   });
    // .then(user10=>{
    //     res.json(user10);
    // })
    // .catch(err=>res.json(err))

})
app.get("/timesheet",(req,res)=>{
    console.log("jijeof");
    ElogTime.find({id: req.params.id})
    .then(user2=>res.json(user2))
    .catch(err=>res.json(err))
})
//{ qty:{ empiddetails: {$all: [req.params.id] }}}
app.post("/register", upload.any(),async(req,res)=>{
   // console.log("hhhhhhhhhhhhhhh");
  /*  upload(req,res,function(err) { 
  
        if(err) { 
  
            // ERROR occurred (here it can be occurred due 
            // to uploading image of size greater than 
            // 1MB or uploading different file type) 
            res.send(err) 
        } 
        else { 
  
            // SUCCESS, image successfully uploaded 
            console.log(req.file);
            res.send("Success, Image uploaded!") 
            
        } 
    }) */
   //console.log(req.files);
    //console.log("jjjjjjjjjjjjjjjjjj");
    //console.log(req.body.fname);
    
    //console.log("l iove");
   // console.log(req.body.email);
    var email=req.body.email;
    Eregister.findOne({email:email},async (err,user)=>{
        
        if(user)
        {
           res.send({message: "User already register"})
           
        }else{
            
            const user = new Eregister({
                fname: req.body.fname,
                lname: req.body.lname,
                email:req.body.email,
                dob:req.body.dob,
                passs:req.body.passs,
                pswrepeat:req.body.pswrepeat,
                gender:req.body.gender,
                id:req.body.id,
                department:req.body.department,
                file:req.files[0].filename,
            })
            //console.log(user);
            //const token= await user.generate();
            const createuser= await user.save();
            res.send({message:"ok done created"})
        }
        
    })
})
//app.delete("/register/:id", (req, res) => {
    //const { eregistersid } = req.body;
  //try {
    //Eregister.deleteOne({ id: eregistersid }, function (err, res) {
      //console.log(err);
    //});
    //res.send({ status: "Ok", data: "Deleted" });
  //} catch (error) {
    //console.log(error);
  //}
  //console.log("Hello", req.params.id);
//});

app.delete("/register/:id", async(req, res) => {
    //ExpenseAndAmountTemplate.findByIdAndRemove(request.params.id, function(err){

        try{
          const id1 = req.params.id;
          console.log(id1);
        const eregisters = await Eregister.deleteOne({id:id1});
        //.then(eregisters => res.json(eregisters))
        //.catch(e => res.json(e))
          if(!id1){
               res.status(400).send();
          }
          else{
            res.send(eregisters => res.json(eregisters));
          }
        }catch(e){
          res.status(404).send(e);
        }
     });
     app.patch("/register/:id", async(req, res) => {
        //ExpenseAndAmountTemplate.findByIdAndRemove(request.params.id, function(err){
        console.log(req.body);
        try{
            await Eregister.updateOne({id:req.params.id},{
                $set: {
                    fname:req.body.fname1,
                    lname: req.body.lname1,
                    email: req.body.email1,
                    dob:req.body.dob1,                           
                }
            })
            return res.json({status: "ok", data: "update"})
        }catch(err){
            res.json({status: "no", data: "noupdate"})
        }
         });

         app.get('/getUsers',(req,res)=>{
            Eleave.find()
            .then(users=>res.json(users))
            .catch(err=>res.json(err))
        })
        app.patch("/leave/:id",async(req,res)=>{
            console.log(req.body);
            try{
            await Eleave.updateOne({id:req.params.id},{
                $set: {
        
                    status:req.body.cars,
        
                }
            })
            return res.json({status: "ok", data: "update"})
        }catch(err){
            res.json({status: "no", data: "noupdate"})
        }
        })
app.listen(8000,()=>{
    console.log("your server is started ai 8000");
})
