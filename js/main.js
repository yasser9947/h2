



// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.19.1/firebase-app.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDVfKD7lzrI2FyGjFEn5rtoVBtf1PWEJyk",
  authDomain: "alhabar-a9e27.firebaseapp.com",
  projectId: "alhabar-a9e27",
  storageBucket: "alhabar-a9e27.appspot.com",
  messagingSenderId: "856199108456",
  appId: "1:856199108456:web:4708e91290210f02c328dd",
  databaseURL: "https://alhabar-a9e27-default-rtdb.europe-west1.firebasedatabase.app"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
import { getDatabase, ref, get, set, child, update, remove, onValue } from "https://www.gstatic.com/firebasejs/9.19.1/firebase-database.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.19.1/firebase-auth.js";
// ============================================================================================================================================
const db = getDatabase();
const auth = getAuth();
let name = document.querySelector("#name");
let roll = document.querySelector("#roll");
let select = document.querySelector("#select");
let table = document.querySelector("table");
const back = document.querySelector("#back");
const next = document.querySelector("#next");
const startOfTheGame = document.querySelector("#start-the-game");
const endOfTheGame = document.querySelector("#end-the-game");
const mainBox = document.querySelector(".main-box");
const winners = document.querySelector("#winners")
// question
const question = document.querySelector(".question");
const option1 = document.querySelector("#option-1")
const option2 = document.querySelector("#option-2")
const option3 = document.querySelector("#option-3")
const option4 = document.querySelector("#option-4")
const options  = [option1,option2,option3,option4]
const userId = auth.currentUser;
const dbRef = ref(getDatabase());
let index = null;
let updates = {};
let startGame = undefined;

let selectOption ={};


function toggleBtn() {
  let btn = next;
  btn.classList.add('is-active');
  
  setTimeout(function () {
      btn.classList.remove('is-active');
  }, 8000)
}

next.addEventListener("click", () => {
  next.disabled = true;
  toggleBtn()
  index++
  updates['questions/' + 'index'] = index;
  if (index >= questions.length - 1) {
    console.log(true);
    next.style.display = "none";;
  } else {
    next.style.display = "inline";
  }
  endOfTheGame.style.display = "inline";
  return update(ref(db), updates);
})

back.addEventListener("click", () => {
  index--
  if (index <= 0) {
    back.style.display = "none";;;
  } else {
    back.style.display = "inline";
  }
  next.style.display = "inline";
  updates['questions/' + 'index'] = index;
  return update(ref(db), updates);
})




onValue(ref(db, 'questions/'), (snapshot) => {

  document.querySelector(".content").style.display = "block"
  document.querySelector(".wait").style.display = "none"
  const username = (snapshot.val() && snapshot.val().username) || 'Anonymous';
  index = snapshot.val()['index']
  startGame =  snapshot.val()['startGame'];
  if (!startGame) {
    startOfTheGame.style.display = "block"
    mainBox.style.display = "none"
    endOfTheGame.style.display = "none"
    back.style.display = "none";
    next.style.display = "none"
    if(snapshot.val()['showWinners']){
      console.log(winners);
      winners.innerHTML  = "<h1> Winners </h1>"
    }
  }
  else{
    mainBox.style.display = "block"
    startOfTheGame.style.display = "none"
    if(snapshot.val()['showWinners']){
      console.log(winners);
      winners.innerHTML  = "<h1> Winners </h1>"
    }
  }
  console.log("index" , index);
  console.log(questions[index]["currectOption"]);

  let max ;
  setTimeout(()=>{
  get(ref(db, 'select/')).then((selection)=> {
    selectOption = selection.val()&& selection.val()[index]
    console.log(selection.val(),index);
    console.log(selectOption);
    if(questions[index]['sp']){
      max = Object.keys(selectOption).find(key => selectOption[key] === Math.max(...Object.values(selectOption)));
    }

  if(Number(index) !=0 ){
    if(questions[index]['sp']){
      options[max.split("-")[1]]?.parentElement.classList.add("currect");
    }else{
      options[questions[index]["currectOption"]]?.parentElement.classList.add("currect");
    }
    if(selectOption){
      option1.innerHTML +=` - <span class="span">${selectOption['s-0']?selectOption['s-0']:0}</span>`
      option2.innerHTML +=` - <span class="span"> ${selectOption['s-1']?selectOption['s-1']:0}</span>`
      option3.innerHTML +=` - <span class="span"> ${selectOption['s-2']?selectOption['s-2']:0}</span>`
      option4.innerHTML +=` - <span class="span"> ${selectOption['s-3']?selectOption['s-3']:0}</span>`
    }
  }
  setTimeout(() => {
    if(questions[index]['sp']){
      options[max.split("-")[1]]?.parentElement.classList.remove("currect");
    }else{
      options[questions[index]["currectOption"]]?.parentElement.classList.remove("currect")
    }
    
    question.innerHTML = questions[index]['question']
    option1.innerHTML = questions[index]['options'][0]
    option2.innerHTML = questions[index]['options'][1]
    option3.innerHTML = questions[index]['options'][2]
    option4.innerHTML = questions[index]['options'][3]
    next.disabled = false;
  }, 5000);
})
} , 5000)
});

const players = document.querySelector("#players");
onValue(ref(db, 'users/'), (snapshot) => {
  players.innerHTML ="";
  let totalPlayer = 0  
  Object.values(snapshot.val())
  .filter(user=>user.alive&& Number(user.index) === Number(index))
  .forEach(user =>{
    totalPlayer++
    players.innerHTML +=` <p class="d-inline-block custom-p m-1"> ${user.name}</p>`
  })
  document.querySelector("#total").innerText = totalPlayer;
})


startOfTheGame.addEventListener("click", () => {
  updates['questions/' + 'startGame'] = true;
  updates['questions/' + 'index'] = 0;
  updates['questions/' + 'showWinners'] = false;
  set(ref(db, 'select'), {})
  return update(ref(db), updates).then(()=>{
    next.style.display = "block";
  });
})



endOfTheGame.addEventListener("click", () => {
  updates['questions/' + 'showWinners'] = true;
  updates['questions/' + 'startGame'] = false;
  // updates['questions/' + 'index'] = 0;
  return update(ref(db), updates).then(()=>{
    next.style.display = "none";
    mainBox.style.display = "none"

  });
})




// selections 



// get(child(dbRef, `users/`)).then((snapshot) => {
//   if (snapshot.exists()) {
//     console.log(snapshot.val());
//   } else {
//     console.log("No data available");
//   }
// }).catch((error) => {
//   console.error(error);
// });
// let index = 0;

  // document.querySelector("button").addEventListener("click",()=>{
//     console.log(name.value , roll.value,select.value);
//     console.log(db);
//     set(ref(db, 'users/' + roll.value), {
//         name:name.value ,
//         gander:select.value
//     }).then(()=>{
//         console.log("addedt ");
//     }).catch((error)=>{
//         console.log(error);
//     })
//     console.log("after");
// })