let questions = [];
let index = 0;
let score = 0;
let timer;
let timeLeft = 30;
let userAnswers = [];

const questionBank = {
  easy: [
    {q:"What is AI?", k:["intelligence","machine","learning"]},
    {q:"Define sensor.", k:["device","detect","input"]}
  ],
  medium: [
    {q:"Explain IoT.", k:["internet","devices","connect"]},
    {q:"What is machine learning?", k:["data","learn","algorithm"]}
  ],
  hard: [
    {q:"Explain neural networks.", k:["neurons","layers","learning"]},
    {q:"What is computer vision?", k:["image","processing","detect"]}
  ]
};

// Login function
function login() {
  let name = document.getElementById("name").value.trim();
  let regno = document.getElementById("regno").value.trim();
  let diff = document.getElementById("difficulty").value;

  if (!name || !regno) { alert("Enter Name & Register No"); return; }

  localStorage.setItem("currentUser", name);

  // Random 5 questions
  questions = questionBank[diff].sort(()=>0.5-Math.random()).slice(0,5);

  document.getElementById("loginBox").classList.add("hidden");
  document.getElementById("examBox").classList.remove("hidden");
  document.getElementById("welcome").innerText = "Welcome " + name;

  index=0; score=0; userAnswers=[];
  showQuestion();
}

// Show question
function showQuestion() {
  if(index >= questions.length){ finishExam(); return; }

  document.getElementById("answer").value = "";
  document.getElementById("feedback").innerHTML = "";
  document.getElementById("question").innerText = questions[index].q;
  document.getElementById("progressBar").value = (index/questions.length)*100;

  startTimer();
}

// Timer
function startTimer(){
  clearInterval(timer);

  // Adjust timer per difficulty
  const diff = document.getElementById("difficulty").value;
  if(diff==='easy') timeLeft=20;
  else if(diff==='medium') timeLeft=30;
  else timeLeft=45;

  document.getElementById("timer").innerText = timeLeft;

  timer = setInterval(()=>{
    timeLeft--;
    document.getElementById("timer").innerText = timeLeft;
    if(timeLeft <=0){ clearInterval(timer); submitAnswer(); }
  },1000);
}

// Submit Answer
function submitAnswer(){
  clearInterval(timer);

  let ans = document.getElementById("answer").value.toLowerCase();
  let keywords = questions[index].k;

  let match = 0;
  keywords.forEach(k=>{ if(ans.includes(k)) match++; });

  let correct = match>=2;
  if(correct){
    score++;
    document.getElementById("feedback").innerHTML = "✅ Correct!";
    speak("Correct answer!");
  } else {
    document.getElementById("feedback").innerHTML = "❌ Wrong. Correct keywords: "+keywords.join(", ");
    speak("Incorrect. Correct keywords: "+keywords.join(", "));
  }

  userAnswers.push({question:questions[index].q, correct:correct});
  index++;
  setTimeout(showQuestion,1500);
}

// Finish Exam
function finishExam(){
  document.getElementById("examBox").classList.add("hidden");
  document.getElementById("reportBox").classList.remove("hidden");

  let percent = Math.round((score/questions.length)*100);
  saveReport(percent);
  drawChart(percent);
  showLeaderboard();
}

// Save report
function saveReport(percent){
  let user = localStorage.getItem("currentUser");
  let results = JSON.parse(localStorage.getItem("results"))||[];
  results = results.filter(r=>r.name!==user); // latest attempt only
  results.push({name:user, score:percent, date:new Date().toLocaleString()});
  localStorage.setItem("results", JSON.stringify(results));
}

// Draw Chart
function drawChart(percent){
  const ctx = document.getElementById("chart");
  new Chart(ctx,{
    type:"doughnut",
    data:{ labels:["Score","Remaining"], datasets:[{data:[percent,100-percent], backgroundColor:["#4facfe","#ccc"]}] },
    options:{ responsive:true }
  });
}

// Leaderboard
function showLeaderboard(){
  const table = document.getElementById("leaderboard");
  table.innerHTML="<tr><th>Rank</th><th>Name</th><th>Score</th></tr>";
  let results = JSON.parse(localStorage.getItem("results"))||[];
  results.sort((a,b)=>b.score-a.score);
  results.forEach((r,i)=>{
    let row = table.insertRow();
    row.insertCell(0).innerText=i+1;
    row.insertCell(1).innerText=r.name;
    row.insertCell(2).innerText=r.score+"%";
  });
}

// Download PDF
function downloadPDF(){
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  let user = localStorage.getItem("currentUser");
  let results = JSON.parse(localStorage.getItem("results"))||[];
  let myReport = results.filter(r=>r.name===user).pop();

  doc.setFontSize(16);
  doc.text("AI Interview Report",20,20);
  doc.setFontSize(12);
  doc.text("Name: "+user,20,40);
  doc.text("Score: "+myReport.score+"%",20,60);
  doc.text("Date: "+myReport.date,20,80);
  doc.save("report.pdf");
}

// Restart
function restart(){ location.reload(); }

// Voice feedback
function speak(text){
  const msg = new SpeechSynthesisUtterance(text);
  window.speechSynthesis.speak(msg);
}