console.log("YandexLMSTools by FlamesCoder")
// Methods

async function getAllLessons(courseId, groupId) {
  return new Promise(function(resolve, reject) {
    fetch(`https://lms.yandex.ru/api/student/lessons?courseId=${courseId}&groupId=${groupId}`)
      .then(response=>response.json())
      .then(data => {
        resolve(data)
      })
  })
}

async function getLessonTasks(courseId, groupId, lessonId) {
  return new Promise(function(resolve, reject) {
    fetch(`https://lms.yandex.ru/api/student/lessonTasks?courseId=${courseId}&lessonId=${lessonId}&groupId=${groupId}`)
      .then(response=>response.json())
      .then(data => {
        resolve(data)
      })
  })
}

async function getSetting(setting) {
  return new Promise(function(resolve, reject) {
    chrome.storage.sync.get(setting, function(data) {
      resolve(data)
    })
  })
}

async function setSetting(setting, value) {
  return new Promise(function(resolve, reject) {
    settingData = {}
    settingData[setting] = value
    chrome.storage.sync.set(settingData, function() {
      resolve(true)
    })
  })
}

function waitForElementToExist(selector) {
  return new Promise(resolve => {
    if (document.querySelector(selector)) {
      return resolve(document.querySelector(selector));
    }

    const observer = new MutationObserver(() => {
      if (document.querySelector(selector)) {
        resolve(document.querySelector(selector));
        observer.disconnect();
      }
    });

    observer.observe(document.body, {
      subtree: true,
      childList: true,
    });
  });
}

function round_str(num) {
  return num.toString().match(/^-?\d+(?:\.\d{0,2})?/)[0]
}

function getURLData() {
  url = window.location.href
  return url.split("/")
}

const RatingValues = {
  "classwork": {"max": 10, "count": 40},
  "homework": {"max": 10, "count": 40},
  "additional": {"max": 40, "count": 45},
  "control-work": {"max": 40, "count": 3},
  "individual-work": {"max": 20, "count": 4},
}

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.message == "changedURL") {
    console.log(request.url)
    PageLoad()
  }
  if (request.message == "storageUpdate") {
    if (request.data["key"] == "setting-dark") {
      DarkTheme(request.data["value"])
    } else if (request.data["key"] == "setting-banner") {
      RemoveBanner()
    } else if (request.data["key"] == "setting-task-score") {
      CalcTaskRating(request.data["value"])
    }
  }
})

window.addEventListener("DOMContentLoaded", function() {
  PageLoad()
})

function YLMTheme(value) {
  let styles = document.createElement("style")

  const css = `.yandexlmstools-rating{display:inline-block;margin-left:15px;border:2px solid #fc0;border-radius:5px;padding:0 10px;max-width:200px}`

  styles.media = "screen"
  styles.classList.add("yandexlmstools-theme")
  styles.textContent = css

  document.head.appendChild(styles)
}

// Settings Functions

function DarkTheme(value) {
  if (value) {
    let styles = document.createElement("style")

    const css = `body,html{color:#fff;background:#1c1e1f!important}*{color:#fff!important}.icon_type_search{background-image:url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB3aWR0aD0iMzIiIGhlaWdodD0iMzIiPjxkZWZzPjxmaWx0ZXIgaWQ9ImRhcmtyZWFkZXItaW1hZ2UtZmlsdGVyIj48ZmVDb2xvck1hdHJpeCB0eXBlPSJtYXRyaXgiIHZhbHVlcz0iMC4yODYgLTAuNzA2IC0wLjc3MiAwLjAwMCAxLjE5MCAtMC43NDIgMC4zMzEgLTAuNzYzIDAuMDAwIDEuMTczIC0wLjczMSAtMC43MDEgMC4yODggMC4wMDAgMS4xNDMgMC4wMDAgMC4wMDAgMC4wMDAgMS4wMDAgMC4wMDAiIC8+PC9maWx0ZXI+PC9kZWZzPjxpbWFnZSB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIGZpbHRlcj0idXJsKCNkYXJrcmVhZGVyLWltYWdlLWZpbHRlcikiIHhsaW5rOmhyZWY9ImRhdGE6aW1hZ2UvcG5nO2Jhc2U2NCxpVkJPUncwS0dnb0FBQUFOU1VoRVVnQUFBQ0FBQUFBZ0NBWUFBQUJ6ZW5yMEFBQUFDWEJJV1hNQUFBc1RBQUFMRXdFQW1wd1lBQUFCZDBsRVFWUjRuTzJXWDBvQ1lSVEZmeWo2a3ZWcXRJUnNEOVVHc2lLc0hVUm1aUzBpd21YMHg5YVRSWllwdElCZUloL3lSZVBDR2ZnUXl1YjdwcEhBQXhkbW1PK2NlK2ZlTzRlQkdmNHg4a0FGYUFKUFFGOWgxemQ2Wm1mK0JOdEFEeGhOaUM2d2xXVGlETkJ3RXR3Qng4QXlNS2NvQVNkQXl6bDNJVzR3R2hMOEJQWW5pTnF6QTUyTmlnaHUrMGlDcXpGNGEwNFJtNzdKODg3TTdjM2pvaXJ1QzVEekthRGl6TnhubGxuZ1hobzdQZ1hjaW55RVArclN1UFloUDR0czIrNkxralRNSjJMalErUkNRQUh6MGpDdDJPZ25VTUNDTk41OXlMMEVSckFTTW9LbXlPWnd2amlUeHFVUGVVL2tWc0JuK0JEeUdlYUFWd21ZdmNaRlRkeU9yeEVaeW80Vm03MytGdXZBQUJnQ0d3UmdFWGh6aXFpcXRkOGhxemNmaUhNZW1yd3RvYWlJa2V5MUxwTXBLR3piVDUyWkQ1VThrMFR5dHU3THprNzhGSjBrMnQ0ZVN4N0JsbWxYdjE5ZG1aVzUzQ053cFczM1hqaEQwV21qbWNjU0thSTRTODRVMnU0NjF2akNwWXJEYVNhZmdiVHhCZTBZaHBRNTAvSkVBQUFBQUVsRlRrU3VRbUNDIiAvPjwvc3ZnPg==)}.icon_type_signal-outline.icon_size_l{background-image:url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB3aWR0aD0iMzIiIGhlaWdodD0iMzIiPjxkZWZzPjxmaWx0ZXIgaWQ9ImRhcmtyZWFkZXItaW1hZ2UtZmlsdGVyIj48ZmVDb2xvck1hdHJpeCB0eXBlPSJtYXRyaXgiIHZhbHVlcz0iMC4yODYgLTAuNzA2IC0wLjc3MiAwLjAwMCAxLjE5MCAtMC43NDIgMC4zMzEgLTAuNzYzIDAuMDAwIDEuMTczIC0wLjczMSAtMC43MDEgMC4yODggMC4wMDAgMS4xNDMgMC4wMDAgMC4wMDAgMC4wMDAgMS4wMDAgMC4wMDAiIC8+PC9maWx0ZXI+PC9kZWZzPjxpbWFnZSB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIGZpbHRlcj0idXJsKCNkYXJrcmVhZGVyLWltYWdlLWZpbHRlcikiIHhsaW5rOmhyZWY9ImRhdGE6aW1hZ2UvcG5nO2Jhc2U2NCxpVkJPUncwS0dnb0FBQUFOU1VoRVVnQUFBQ0FBQUFBZ0NBWUFBQUJ6ZW5yMEFBQUFDWEJJV1hNQUFBc1RBQUFMRXdFQW1wd1lBQUFCRUVsRVFWUjRuTzNXc1VyRFVCVEc4WjhLVmNUUnpTZFFjQkVFc2FPTDRpczV1QlFkQkJVcStBamlPemo3QnU1YVN5ZWRSQVd4a2NBWmdvcWE5SnBTeUFjSFFyamYrZjczbmlTRVJoT3NYZHlqaDUxeEFQU1FSZDNWR2J5S1V3d0xBUG4xTVpiL00zZ1dYYndYZ2ovWEd3NHhrenA4RGxjUjhvSWpyS0dGZVd6Z1BBRHlOWmVZVGdsd0ZvMXZzZkxEdWpZZVl1MWV5cGtQOFJ6WHYya3J4dlNLcFJRQTNkalJTUW5QUlhqMlV3RGNSTFAxRXA3dDhGeW5BSGlLWmdzbFBJdmhlVXdCa0VXVjBWVGgrekFXZ0ZGOFg5UUFaTTBJTkEraDhiMkc3V2d5cU9BZGhIZXphbmlXdUNZUDRLL0hPOHFZS3FzZm9lMENRUDZMWHBzT3ZqbmlUcDBBcllEb3g4NDdjYS9SNU9rRE9zZVNSem5kSWM0QUFBQUFTVVZPUks1Q1lJST0iIC8+PC9zdmc+")}.notification-center{background:#1c1e1f!important}.notification-center__item_theme_light{border-color:#afa494!important}.Accordion,.course-card{border:1px solid #3f4547}.lesson-card:not(.lesson-card_narrow) .lesson-card__percentage_non-zero,.solution-status_type_accepted .solution-status__text{color:#71f871!important}.lesson-card__deadline,.lesson-card__full-caption,.lesson-card__lesson-info,.lesson-card__percentage,.lesson-card__progress{color:#afa494!important}.link-list__item{border:1px solid #3f4547!important}.progress-bar_theme_light{background-color:#232526!important}.nav-tab_back{background:#1c1e1f}.solution-status_type_rework .solution-status__text{color:#ff3030!important}.solution-status_type_review{background:#ffeba02e}.Accordion-Item{border-top:1px solid #3f4547}.Accordion-Group:not(:last-of-type) .Accordion-Item:last-of-type{border-bottom-color:#3f4547}.superscript-icon{background:#bc00ff8c}.Sideblock-Content{background:#232526!important}`

    styles.media = "screen"
    styles.classList.add("yandexlmstools-dark")
    styles.textContent = css

    document.head.appendChild(styles)
  } else {
    let yltDark = document.querySelector(".yandexlmstools-dark")
    yltDark.parentNode.removeChild(yltDark)
  }
}

function RemoveBanner() {
  try {
    let banner = document.querySelector(".course-banners")
    if (banner) {
      try {
        banner.parentNode.removeChild(banner)
      } catch {
        console.log("Failed to remove banner")
      }
    }
  } catch {
    console.log("Failed to remove banner")
  }

}

async function CalcTaskRating(value) {
  url = getURLData()
  // console.log(url)
  let tasks = document.querySelectorAll(".yandexlmstools-rating")
  // Remove block

  if (value) {
    if (url.includes("tasks")) {
      const stats = await waitForElementToExist(".y43a24--task-info")
  
      let posibleRating = document.createElement("div")
      posibleRating.classList.add("yandexlmstools-rating")
  
      let RatingValue = document.createElement("span")
      RatingValue.classList.add("yandexlmstools-rating__value")
  
      let RatingTitle = document.createElement("span")
      RatingTitle.textContent = "Possible rating: "
      posibleRating.appendChild(RatingTitle)
  
      let tasks = await getLessonTasks(url[4], url[6], url[8])
  
      let tasksNumber = {}
      let SelTask = null
      
      tasks.forEach(taskGroup => {
        taskGroup["tasks"].forEach(task => {
          type = task["tag"]["type"]
          score = task["scoreMax"]
  
          if (task["id"] == url[10]) {
            SelTask = task
          }
  
          tasksNumber[type] = (tasksNumber[type] || 0) + 1
        });
      });
  
      type = SelTask["tag"]["type"]
  
      RatingValue.textContent = round_str(RatingValues[type]["max"] / RatingValues[type]["count"] / 100 * SelTask["scoreMax"])
      posibleRating.appendChild(RatingValue)
      stats.appendChild(posibleRating)
    } else if (url.includes("lessons")) {
      const stats = await waitForElementToExist(".student-lesson-progress__counts")
  
      let posibleRating = document.createElement("div")
      posibleRating.classList.add("yandexlmstools-rating")
  
      let RatingValue = document.createElement("span")
      RatingValue.classList.add("yandexlmstools-rating__value")
  
      let RatingTitle = document.createElement("span")
      RatingTitle.textContent = "Possible rating: "
      posibleRating.appendChild(RatingTitle)
  
      let tasks = await getLessonTasks(url[4], url[6], url[8])
  
      let tasksNumber = {}
      
      tasks.forEach(taskGroup => {
        taskGroup["tasks"].forEach(task => {
          type = task["tag"]["type"]
          score = task["scoreMax"]
  
          tasksNumber[type] = (tasksNumber[type] || 0) + 1
        });
      });

      let rating = 0
      Object.entries(tasksNumber).forEach(t => {
        rating = rating + (RatingValues[t[0]]["max"] / RatingValues[t[0]]["count"])
      })
  
      RatingValue.textContent = round_str(rating)
      posibleRating.appendChild(RatingValue)
      stats.appendChild(posibleRating)
    }
  } else {
    try {
      tasks.forEach(el => {
        el.parentNode.removeChild(el)
      })
    } catch {
      console.log("Failed to remove Rating block")
    }
  }
}

async function PageLoad() {
  url = getURLData()
  console.log(url)
  await setSetting("courseId", url[4])
  YLMTheme()
  let darkTheme = await getSetting("setting-dark")
  if (darkTheme["setting-dark"]) {
    DarkTheme(true)
  }
  let removeBanner = await getSetting("setting-banner")
  if (removeBanner["setting-banner"]) {
    RemoveBanner()
  }
  let calcTaskRating = await getSetting("setting-task-score")
  if (calcTaskRating["setting-task-score"]) {
    CalcTaskRating(true)
  }
}
