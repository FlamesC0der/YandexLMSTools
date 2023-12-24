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
      resolve(data[setting])
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

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.message == "Installed") {
    PageLoad()
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

    const css = `body,html{color:#fff;background:#1c1e1f!important}* :not(pre span) :not(pre span span){color:#fff!important}.icon_type_search{background-image:url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB3aWR0aD0iMzIiIGhlaWdodD0iMzIiPjxkZWZzPjxmaWx0ZXIgaWQ9ImRhcmtyZWFkZXItaW1hZ2UtZmlsdGVyIj48ZmVDb2xvck1hdHJpeCB0eXBlPSJtYXRyaXgiIHZhbHVlcz0iMC4yODYgLTAuNzA2IC0wLjc3MiAwLjAwMCAxLjE5MCAtMC43NDIgMC4zMzEgLTAuNzYzIDAuMDAwIDEuMTczIC0wLjczMSAtMC43MDEgMC4yODggMC4wMDAgMS4xNDMgMC4wMDAgMC4wMDAgMC4wMDAgMS4wMDAgMC4wMDAiIC8+PC9maWx0ZXI+PC9kZWZzPjxpbWFnZSB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIGZpbHRlcj0idXJsKCNkYXJrcmVhZGVyLWltYWdlLWZpbHRlcikiIHhsaW5rOmhyZWY9ImRhdGE6aW1hZ2UvcG5nO2Jhc2U2NCxpVkJPUncwS0dnb0FBQUFOU1VoRVVnQUFBQ0FBQUFBZ0NBWUFBQUJ6ZW5yMEFBQUFDWEJJV1hNQUFBc1RBQUFMRXdFQW1wd1lBQUFCZDBsRVFWUjRuTzJXWDBvQ1lSVEZmeWo2a3ZWcXRJUnNEOVVHc2lLc0hVUm1aUzBpd21YMHg5YVRSWllwdElCZUloL3lSZVBDR2ZnUXl1YjdwcEhBQXhkbW1PK2NlK2ZlTzRlQkdmNHg4a0FGYUFKUFFGOWgxemQ2Wm1mK0JOdEFEeGhOaUM2d2xXVGlETkJ3RXR3Qng4QXlNS2NvQVNkQXl6bDNJVzR3R2hMOEJQWW5pTnF6QTUyTmlnaHUrMGlDcXpGNGEwNFJtNzdKODg3TTdjM2pvaXJ1QzVEekthRGl6TnhubGxuZ1hobzdQZ1hjaW55RVArclN1UFloUDR0czIrNkxralRNSjJMalErUkNRQUh6MGpDdDJPZ25VTUNDTk41OXlMMEVSckFTTW9LbXlPWnd2amlUeHFVUGVVL2tWc0JuK0JEeUdlYUFWd21ZdmNaRlRkeU9yeEVaeW80Vm03MytGdXZBQUJnQ0d3UmdFWGh6aXFpcXRkOGhxemNmaUhNZW1yd3RvYWlJa2V5MUxwTXBLR3piVDUyWkQ1VThrMFR5dHU3THprNzhGSjBrMnQ0ZVN4N0JsbWxYdjE5ZG1aVzUzQ053cFczM1hqaEQwV21qbWNjU0thSTRTODRVMnU0NjF2akNwWXJEYVNhZmdiVHhCZTBZaHBRNTAvSkVBQUFBQUVsRlRrU3VRbUNDIiAvPjwvc3ZnPg==)}.icon_type_signal-outline.icon_size_l{background-image:url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB3aWR0aD0iMzIiIGhlaWdodD0iMzIiPjxkZWZzPjxmaWx0ZXIgaWQ9ImRhcmtyZWFkZXItaW1hZ2UtZmlsdGVyIj48ZmVDb2xvck1hdHJpeCB0eXBlPSJtYXRyaXgiIHZhbHVlcz0iMC4yODYgLTAuNzA2IC0wLjc3MiAwLjAwMCAxLjE5MCAtMC43NDIgMC4zMzEgLTAuNzYzIDAuMDAwIDEuMTczIC0wLjczMSAtMC43MDEgMC4yODggMC4wMDAgMS4xNDMgMC4wMDAgMC4wMDAgMC4wMDAgMS4wMDAgMC4wMDAiIC8+PC9maWx0ZXI+PC9kZWZzPjxpbWFnZSB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIGZpbHRlcj0idXJsKCNkYXJrcmVhZGVyLWltYWdlLWZpbHRlcikiIHhsaW5rOmhyZWY9ImRhdGE6aW1hZ2UvcG5nO2Jhc2U2NCxpVkJPUncwS0dnb0FBQUFOU1VoRVVnQUFBQ0FBQUFBZ0NBWUFBQUJ6ZW5yMEFBQUFDWEJJV1hNQUFBc1RBQUFMRXdFQW1wd1lBQUFCRUVsRVFWUjRuTzNXc1VyRFVCVEc4WjhLVmNUUnpTZFFjQkVFc2FPTDRpczV1QlFkQkJVcStBamlPemo3QnU1YVN5ZWRSQVd4a2NBWmdvcWE5SnBTeUFjSFFyamYrZjczbmlTRVJoT3NYZHlqaDUxeEFQU1FSZDNWR2J5S1V3d0xBUG4xTVpiL00zZ1dYYndYZ2ovWEd3NHhrenA4RGxjUjhvSWpyS0dGZVd6Z1BBRHlOWmVZVGdsd0ZvMXZzZkxEdWpZZVl1MWV5cGtQOFJ6WHYya3J4dlNLcFJRQTNkalJTUW5QUlhqMlV3RGNSTFAxRXA3dDhGeW5BSGlLWmdzbFBJdmhlVXdCa0VXVjBWVGgrekFXZ0ZGOFg5UUFaTTBJTkEraDhiMkc3V2d5cU9BZGhIZXphbmlXdUNZUDRLL0hPOHFZS3FzZm9lMENRUDZMWHBzT3ZqbmlUcDBBcllEb3g4NDdjYS9SNU9rRE9zZVNSem5kSWM0QUFBQUFTVVZPUks1Q1lJST0iIC8+PC9zdmc+")}.logo{background-image:url("data:image/png;base64,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")!important}.Accordion,.code-editor__control-button,.code-editor__controls,.comments__comment-text,.course-card,.link-list__item,.student-profile-course-card,.y1b87d--comments__header,.y5bb67--submission__file,.yadc9f--rounded-wrapper{border-color:#3f4547!important}.CodeMirror-gutters,.CodeMirror-scroll,.code-editor__controls,.comments__form,.comments__textarea,.legouser__menu-footer,.light-popup,.nav-tab,.nav-tab_back,.notification-center{background:#1c1e1f!important}.notification-center__item_theme_light{border-color:#afa494!important}.lesson-card:not(.lesson-card_narrow) .lesson-card__percentage_non-zero,.solution-status_type_accepted .solution-status__text{color:#71f871!important}.lesson-card__deadline,.lesson-card__full-caption,.lesson-card__lesson-info,.lesson-card__percentage,.lesson-card__progress{color:#afa494!important}.progress-bar_theme_light{background-color:#232526!important}.solution-status_type_rework .solution-status__text{color:#ff3030!important}.solution-status_type_review{background:#ffeba02e!important}.Accordion-Item{border-top:1px solid #3f4547!important}.Accordion-Group:not(:last-of-type) .Accordion-Item:last-of-type{border-bottom-color:#3f4547!important}.superscript-icon{background:#bc00ff8c!important}.Sideblock-Content{background:#232526!important}.indicator_color_grey{background:#747474!important}`

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
      banner.parentNode.removeChild(banner)
    }
  } catch {
    console.log("Failed to remove banner")
  }

}

async function RemoveParentInvite() {
  try {
    let banner = await waitForElementToExist(".parent-invite")
    console.log(banner)
    if (banner) {
      banner.parentNode.removeChild(banner)
    }
  } catch {
    console.log("Failed to remove Parent-invite")
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
  // url = getURLData()
  // console.log(url)

  // await setSetting("courseId", url[4])

  YLMTheme()

  if (await getSetting("setting-dark")) {
    DarkTheme(true)
  }
  if (await getSetting("setting-banner")) {
    RemoveBanner()
  }
  if (await getSetting("setting-parent-invite")) {
    RemoveParentInvite()
  }
  if (await getSetting("setting-task-score")) {
    CalcTaskRating(true)
  }
}
