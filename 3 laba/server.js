
const express = require('express');
const mongodb = require('mongodb');

const regex_url = /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[\-;:&=\+\$,\w]+@)?[A-Za-z0-9\.\-]+|(?:www\.|[\-;:&=\+\$,\w]+@)[A-Za-z0-9\.\-]+)((?:\/[\+~%\/\.\w\-_]*)?\??(?:[\-\+=&;%@\.\w_]*)#?(?:[\.\!\/\\\w]*))?)/g

const MongoClient = mongodb.MongoClient;
const mongoUrl = 'mongodb+srv://admin:admin@cluster0.nwkbw.mongodb.net/lab3';
const domen = 'http://localhost:3000';

const app = express();
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');

app.use('/static', express.static(__dirname + '/public'));

let mongo;

MongoClient.connect(mongoUrl, {useUnifiedTopology: true})
.then(function(client) {
  mongo = client.db();
}).catch((error) => console.log(error.message));

app.get('/', function(request, response) {
  response.render('index');
});

app.get('/:id', function(request, response) {
  code = request.params.id;
  mongo.collection('urls').findOne({url_code: code}, function(err, doc) {
    doc != null ? response.redirect(doc.main_url) : response.render('not_found');;
  });
});

app.post('/', async function(request, response) {
  let arr_url_0 = request.body.input.match(regex_url);

  if (arr_url_0 != null && request.body.input != '' && arr_url_0[0].lastIndexOf('http') == 0) {
    mongo.collection('urls').findOne({main_url: request.body.input}, function(err, doc) {
      if (doc != null){
        response.json( {url: domen + '/' + doc.url_code, m_url: request.body.input} );
        
      }
      else {
        let id_s = get_random_id(); 
        mongo.collection('urls').insertOne({
          url_code: id_s,
          main_url: request.body.input,
        }).then(function() {
          console.log('Запис створено');
        });
        response.json( {url: domen + '/' + id_s, m_url: request.body.input} );
      }
    });
  }
  else{
    response.json({status: "invalid"});
  }
});

app.get('*', function(request, response) {
  response.render('not_found');
});

app.listen(3000, function() {
  console.log('App started on '+ domen);
});

function get_random_id() {
  let s = (Number(new Date)+getRandomInt(15000)+getRandomInt(100000000)).toString();
  s += '0';
  let len = 14;//13 + 1
  let result = "";
  for (let i = 0; i < len; i+=2){
    result += get_string_or_char_N(Number(s[i] + s[i+1]));
  }
  return result; 
}
function get_string_or_char_N(s){//0-99
  s+=48;
  if (s>=48 && s<=57){
    return String.fromCharCode(s);
  }
  else if(s>=65 && s<=90){
    return String.fromCharCode(s);
  }
  else if(s>=97 && s<=122) {
    return String.fromCharCode(s);
  }
  else{
    s = s.toString();
    return s;
  }
}
function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}