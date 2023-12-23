chrome.tabs.onUpdated.addListener(
  function(tabId, changeInfo, tab) {
    if (changeInfo.url) {
      if (!changeInfo.url.includes("solutions")) {
        chrome.tabs.sendMessage( tabId, {
          message: 'changedURL',
          url: changeInfo
        })
      }
    }
  }
);

chrome.storage.onChanged.addListener(
  function(changes, namespace) {
    for (var key in changes) {
      var storageChange = changes[key];

      chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {
          message: 'storageUpdate',
          data: {key: Object.keys(changes)[0], value: storageChange.newValue}
        })
      })
    }
  }
)
// function Main() {
//   console.log("YandexLMSTools By @FlamesCoder")

//   function ScoreData () {
//     url = getURLData()
//     fetch(`https://lms.yandex.ru/api/student/lessonTasks?courseId=${url[4]}&lessonId=${url[8]}&groupId=${url[6]}`)
//     .then(response=>response.json())
//     .then(tasks => {
//       tasksNumber = {}
//       taskGroupNumer = {}
//       scores = {}

//       tasks.forEach(taskGroup => {
//         taskGroupNumer[taskGroup["type"]] = (taskGroupNumer[taskGroup["type"]] || 0) + 1
//         taskGroup["tasks"].forEach(task => {
//           type = task["tag"]["type"]
//           score = task["scoreMax"]

//           tasksNumber[type] = (tasksNumber[type] || 0) + 1
//           scores[type] = (scores[type] || 0) + score
//         });
//       });

//       let ScoreWrapper = document.createElement("div")
//       ScoreWrapper.classList.add("yandexlmstools-score")

//       const lessonProgress = document.querySelector(".student-lesson-progress__counts")

//       lessonProgress.appendChild(ScoreWrapper)
      
//       Object.entries(scores).forEach(data => {
//         ScoreWrapper.innerHTML += `<span class="yandexlmstools-score__field field__${data[0]}">${data[0]} - ${data[1]}</span>`
//         console.log(data[0], data[1])
//       })
//     })
//   }