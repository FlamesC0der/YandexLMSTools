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

async function getUserData() {
  return new Promise(function(resolve, reject) {
    fetch(`https://lms.yandex.ru/api/profile?withChildren=true&withCoursesSummary=true&withExpelled=true&withParents=true`)
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

const RatingValues = {
  "classwork": {"max": 10, "count": 40},
  "homework": {"max": 10, "count": 40},
  "additional": {"max": 40, "count": 45},
  "control-work": {"max": 40, "count": 3},
  "individual-work": {"max": 20, "count": 4},
}

const links = {
  website: "https://flamecoder.pages.dev/",
  donate: "https://boosty.to/flamescoder",
  github: "https://github.com/FlamesC0der/YandexLMSTools",
}

function createLink(url, id) {
  document.getElementById(id).addEventListener("click", () => {
    chrome.tabs.create({ url: url })
  })
}

function renderSettings() {
  const SettingsButton = document.getElementById("settings-btn")
  const SettingsPage = document.getElementById("settings")
  const settingsFields = document.querySelector(".settings__fields")

  let settings = {
    "main": {
      "setting-dark": {txt: "Dark Theme", default: true, beta: true},
      "setting-banner": {txt: "Remove Banner", default: true, beta: false},
      "setting-parent-invite": {txt: "Remove Parent invite", default: false, beta: true}
    },
    "rating": {
      "setting-task-score": {txt: "Calculate task rating", default: true, beta: true},
    }
  }

  if (SettingsPage.classList.contains("settings__opened")) {
    settingsFields.innerHTML = ""

    Object.entries(settings).forEach(group => {
      let SettingsGroup = document.createElement("ul")
      SettingsGroup.classList.add("settings-group")
      let title = document.createElement("p")
      title.classList.add("settings-group__title")

      title.textContent = group[0]
      SettingsGroup.appendChild(title)

      Object.entries(group[1]).forEach(async setting => {
        let setting_data = await getSetting(setting[0])
        
        if (setting_data[setting[0]] == null) {
          await setSetting(setting[0], setting[1]["default"])
          setting_data = await getSetting(setting[0])
        }
        
        // Obj

        let li = document.createElement("li")
        li.classList.add("settings-group__field")

        let label = document.createElement("label")
        label.classList.add("switch")
        label.htmlFor = setting[0]
        li.appendChild(label)

        let input = document.createElement("input")
        input.type = "checkbox"
        input.checked = setting_data[setting[0]]
        input.id = setting[0]
        input.addEventListener("change", async function() {
          await setSetting(this.id, this.checked);
        })
        label.appendChild(input)

        let div = document.createElement("div")
        div.classList.add("slider")
        div.classList.add("round")
        label.appendChild(div)

        let p = document.createElement("p")
        p.classList.add("setting-field__text")
        p.innerHTML = `<p class="setting-field__text">${setting[1]["txt"]} ${setting[1]["beta"] ? `<span class="setting-field__beta">beta</span>` : ""}</p>`
        li.appendChild(p)

        // Obj end

        SettingsGroup.appendChild(li)
      })

      settingsFields.appendChild(SettingsGroup)
    })
    let resetBtn = document.createElement("button")
    resetBtn.textContent = 'Reset'
    resetBtn.classList.add("settings-reset")
    resetBtn.addEventListener("click", function() {
      chrome.storage.sync.clear()
      renderSettings()
    })
    settingsFields.appendChild(resetBtn)
  }
}

// async function renderRating() {
//   const courseId = (await getSetting("courseId"))["courseId"]

//   const rating = ((await getUserData())["coursesSummary"]["student"].find(x => x.id == courseId)).rating
//   console.log(rating)
// }

document.addEventListener("DOMContentLoaded", async function() {
  createLink(links.website, "link-website")
  createLink(links.donate, "link-donate")
  createLink(links.github, "link-github")
  
  const SettingsButton = document.getElementById("settings-btn")
  const SettingsPage = document.getElementById("settings")

  // Settings

  SettingsButton.addEventListener("click", function() {
    SettingsPage.classList.toggle("settings__opened")
    SettingsButton.classList.toggle("settings-btn__opened")
    renderSettings()
  })

  // renderRating()
})
