const express = require('express');
const model = require('./model');
const query = require('./query');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const auth = require('./middleware')
var nodemailer = require('nodemailer');

require('dotenv').config();

const app = express();
app.use(express.json());
app.use(bodyParser.json());
app.use(cors())
const port = process.env.PORT;
const server = mongoose.connect(process.env.MONGO_URI, { retryWrites: true, w: 'majority' })
.then(()=>{
    console.log('Connected to database successfully');
})
.catch((err)=>{
    console.log(err);
})

app.get('/', (req, res) => {
  res.send('Express + TypeScript Server');
});

app.post('/register', async (req, res)=>{
  const check = await model.findOne({ email: req.body.email });
  const salt = await bcrypt.genSalt(10);
  const hash  = await bcrypt.hash(req.body.password, salt);
  console.log(hash);
  
   if(!check){
     const user = new model({
       fname: req.body.fname,
       lname: req.body.lname,
       email: req.body.email,
       password: hash
     });
     console.log(user);
     const saveUser = await user.save();
     if(!saveUser){
       res.status(422).json({"message": "Error while saving data"})
     }else{
       res.status(201).json({"user": saveUser, "success": " User created successfully"})
     }
   }else{
    res.status(402).json({ "error": "User already exists with the given email!" })
   }
})

app.post('/login', async (req, res)=>{
  try {
    const email = await model.findOne({email: req.body.email});
    if(email){
      let matchPasswords = await bcrypt.compare(req.body.password, email.password);
      
      if(!matchPasswords){
        res.status(401).json({ "error": "invalid credentials!" })
      }else{
        const data = {
          user: {
            id: email._id
          } 
        }
        const token = jwt.sign(data, process.env.JWT_SECRET_KEY);
        res.cookie("jwt", token);
        res.status(202).json({ "success": "user loggedin successfully!", "user": email, "token": token });
      }
    }else{
      res.status(301).json({ "error": "No user found of the given email!" })
    }
  } catch (error) {
    res.status(500).json({ "error": error })
  }
})

app.post('/query', async (req, res)=>{
  try {
    const info = new query({
      name: req.body.name,
      email: req.body.email,
      mobile: req.body.mobile,
      message: req.body.message
    })
    console.log(req.body);
    await info.save()
    var transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'mohd.afzal.278610@gmail.com',
        pass: 'ykhgeeyvepvjwpcu'
      }
  });
  var mailOptions = {
      from: 'mohd.afzal.278610@gmail.com',
      to: req.body.email,
      subject: 'Thank you',
      text: 'Thank you for visiting out website. Your query have been send successfully. Our team will contact you in no time. Have a nice day.'
    };

    var mailOptiondev = {
      from: 'mohd.afzal.278610@gmail.com',
      to: 'moafzalhd786@gmail.com',
      subject: 'New query from portfolio',
      text: `Hello, ${req.body.name} was trying to contact to you. Email - ${req.body.email}, Mobile number - ${req.body.mobile}, Message - ${req.body.message}.`
    };

    transporter.sendMail(mailOptions, function(error, info){
      if (error) {
        console.log(error);
        res.send(error).status(400);
      } else {
        console.log('Email sent: ' + info.response);
        res.send("Mail sent successfully.").status(200);
      }
    });

    transporter.sendMail(mailOptiondev, function(error, info){
      if (error) {
        console.log(error);
        res.send(error).status(400);
      } else {
        console.log('Email sent: ' + info.response);
        res.send("Mail sent successfully.").status(200);
      }
    });
    res.status(201).json({message: "Your Query has been submitted successfully."})
  } catch (error) {
    res.status(201).json({message: "Unable to send you query."});
  }
});

app.post('/getquery', auth, async(req, res)=>{
  try {
    const queries = await query.find({});
    res.status(200).send(queries);
  } catch (error) {
    console.log(error);
  }
});

app.get('/mailSend', async (req, res)=>{
  var transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'mohd.afzal.278610@gmail.com',
        pass: 'ykhgeeyvepvjwpcu'
      }
  });
  var mailOptions = {
      from: 'mohd.afzal.278610@gmail.com',
      to: 'moafzalhd786@gmail.com',
      subject: 'Sending Email using Node.js',
      text: 'That was easy!'
    };

    transporter.sendMail(mailOptions, function(error, info){
      if (error) {
        console.log(error);
        res.send(error).status(400);
      } else {
        console.log('Email sent: ' + info.response);
        res.send("Mail sent successfully.").status(200);
      }
    });
});

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});